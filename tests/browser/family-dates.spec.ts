import { expect, test } from "@playwright/test";
import { parseFamilyDate, serializeFamilyDate, validateFamilyDate } from "../../src/lib/family-dates";

test("family dates retain precision and historical text", () => {
  for (const value of ["", "0001", "1885", "1900-02", "2000-02-29", "2024-12-31"]) {
    expect(validateFamilyDate(value), value).toBe(true);
    expect(serializeFamilyDate(parseFamilyDate(value)), value).toBe(value);
  }
  for (const value of ["around 1900", "before 1885", "1930s", "12 May 1870", "500 BCE"]) {
    expect(parseFamilyDate(value).precision).toBe("text");
    expect(validateFamilyDate(value)).toBe(true);
  }
});

test("incomplete and impossible calendar dates cannot be saved as exact dates", () => {
  for (const value of ["????", "1900-??", "2000-02-??", "0000", "1900-02-29", "2023-02-29", "2024-04-31", "2024-13-01", "2024-01-00"]) {
    expect(validateFamilyDate(value), value).not.toBe(true);
  }
  expect(validateFamilyDate("2000-02-29")).toBe(true);
  expect(validateFamilyDate("2024-02-29")).toBe(true);
});
