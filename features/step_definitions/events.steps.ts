import { Given, When, Then, Before } from '@cucumber/cucumber';
import axios from 'axios';

let apiUrl: string;
let lastResponse: any;
let lastError: any;

Before(function () {
  apiUrl = process.env.STAGING_URL || 'http://localhost:3000';
  lastResponse = null;
  lastError = null;
});

Given('the API is running at URL from environment', function () {
  expect(apiUrl).toBeDefined();
});

When('I send a GET request to {string}', async function (endpoint: string) {
  try {
    lastResponse = await axios.get(`${apiUrl}${endpoint}`);
  } catch (error) {
    lastError = error;
  }
});

When('I send a POST request to {string} with body:', async function (endpoint: string, dataTable: any) {
  try {
    const data = dataTable.rowsHash();
    lastResponse = await axios.post(`${apiUrl}${endpoint}`, data);
  } catch (error) {
    lastError = error;
  }
});

Then('the response status code should be {int}', function (expectedStatus: number) {
  if (lastError) {
    expect(lastError.response?.status).toBe(expectedStatus);
  } else {
    expect(lastResponse?.status).toBe(expectedStatus);
  }
});

Then('the response should contain a list of events', function () {
  expect(Array.isArray(lastResponse.data)).toBe(true);
});

Then('the response should contain an event ID', function () {
  expect(lastResponse.data).toHaveProperty('_id');
});

Then('the response should contain a booking confirmation', function () {
  expect(lastResponse.data).toHaveProperty('_id');
  expect(lastResponse.data).toHaveProperty('eventId');
  expect(lastResponse.data).toHaveProperty('userName');
});

Then('the response should contain the event details', function () {
  expect(lastResponse.data).toHaveProperty('title');
  expect(lastResponse.data).toHaveProperty('description');
  expect(lastResponse.data).toHaveProperty('date');
});

Given('an event exists with slug {string}', async function (slug: string) {
  try {
    lastResponse = await axios.get(`${apiUrl}/api/events/${slug}`);
    expect(lastResponse.status).toBe(200);
  } catch (error) {
    throw new Error(`Event with slug ${slug} not found`);
  }
});

Given('an event exists with ID {string}', async function (eventId: string) {
  try {
    lastResponse = await axios.get(`${apiUrl}/api/events/${eventId}`);
    expect(lastResponse.status).toBe(200);
  } catch (error) {
    throw new Error(`Event with ID ${eventId} not found`);
  }
});
