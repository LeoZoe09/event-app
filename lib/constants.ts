import Page from "@/app/page";

export type EventItem = {
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
};

export const events: EventItem[] = [
    {
        title: "React Summit 2025",
        image: "/images/event1.png",
        slug: "react-summit-2025",
        location: "Amsterdam, Netherlands",
        date: "May 16–17, 2025",
        time: "09:00 AM – 6:00 PM",
    },
    {
        title: "Google I/O 2025",
        image: "/images/event2.png",
        slug: "google-io-2025",
        location: "Mountain View, CA, USA",
        date: "June 10–12, 2025",
        time: "10:00 AM – 5:00 PM",
    },
    {
        title: "Next.js Conf 2025",
        image: "/images/event3.png",
        slug: "nextjs-conf-2025",
        location: "San Francisco, CA, USA (Hybrid)",
        date: "October 2, 2025",
        time: "09:00 AM – 5:00 PM",
    },
    {
        title: "Hack the North 2025",
        image: "/images/event4.png",
        slug: "hack-the-north-2025",
        location: "Waterloo, Canada",
        date: "September 12–14, 2025",
        time: "All Day Event",
    },
    {
        title: "AWS re:Invent 2025",
        image: "/images/event5.png",
        slug: "aws-reinvent-2025",
        location: "Las Vegas, NV, USA",
        date: "November 30 – December 5, 2025",
        time: "08:00 AM – 6:00 PM",
    },
    {
        title: "Open Source Summit Europe 2025",
        image: "/images/event6.png",
        slug: "open-source-summit-europe-2025",
        location: "Vienna, Austria",
        date: "September 16–18, 2025",
        time: "09:00 AM – 5:30 PM",
    },
];

export default events
