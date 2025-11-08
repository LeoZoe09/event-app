import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BookEvent from "../BookEvent";

// Mock der Action-Funktion
jest.mock("@/lib/actions/booking.actions", () => ({
  createBooking: jest.fn(),
}));

import { createBooking } from "@/lib/actions/booking.actions";

describe("BookEvent Component", () => {
  const eventId = "123";
  const slug = "test-event";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rendert das Formular initial", () => {
    render(<BookEvent eventId={eventId} slug={slug} />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  test("ändert den E-Mail-Wert bei Benutzereingabe", () => {
    render(<BookEvent eventId={eventId} slug={slug} />);
    const input = screen.getByLabelText(/email address/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(input.value).toBe("test@example.com");
  });

  test("ruft createBooking mit korrekten Parametern auf", async () => {
    (createBooking as jest.Mock).mockResolvedValue({ success: true });

    render(<BookEvent eventId={eventId} slug={slug} />);

    const input = screen.getByLabelText(/email address/i);
    const button = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(input, { target: { value: "user@example.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createBooking).toHaveBeenCalledWith({
        eventId,
        slug,
        email: "user@example.com",
      });
    });
  });

  test("zeigt 'Thank you' Nachricht bei erfolgreicher Buchung", async () => {
    (createBooking as jest.Mock).mockResolvedValue({ success: true });

    render(<BookEvent eventId={eventId} slug={slug} />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "success@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText(/thank you for signing up/i)).toBeInTheDocument();
  });

  test("zeigt keine Erfolgsmeldung, wenn createBooking fehlschlägt", async () => {
    (createBooking as jest.Mock).mockResolvedValue({ success: false });
    console.error = jest.fn();

    render(<BookEvent eventId={eventId} slug={slug} />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.queryByText(/thank you/i)).not.toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith("Booking creation failed");
    });
  });
});