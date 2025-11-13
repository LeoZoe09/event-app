Feature: Event Management
  As a user
  I want to manage events
  So that I can create, view, and book events

  Background:
    Given the API is running at URL from environment

  Scenario: Successfully retrieve all events
    When I send a GET request to "/api/events"
    Then the response status code should be 200
    And the response should contain a list of events

  Scenario: Create a new event
    When I send a POST request to "/api/events" with body:
      | title       | Tech Conference 2025      |
      | description | Annual tech conference    |
      | date        | 2025-12-15                |
      | location    | San Francisco             |
      | capacity    | 500                       |
    Then the response status code should be 201
    And the response should contain an event ID

  Scenario: Retrieve event by slug
    Given an event exists with slug "tech-conference"
    When I send a GET request to "/api/events/tech-conference"
    Then the response status code should be 200
    And the response should contain the event details

  Scenario: Book an event
    Given an event exists with ID "test-event-123"
    When I send a POST request to "/api/events/test-event-123/book" with body:
      | name  | John Doe       |
      | email | john@example.com |
    Then the response status code should be 201
    And the response should contain a booking confirmation
