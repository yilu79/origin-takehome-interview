// __tests__/setup-verification.test.tsx
import React from "react";
import { render, screen } from "./utils/test-utils";

describe("Test Setup Verification", () => {
  it("Jest and React Testing Library are working", () => {
    const TestComponent = () => <div>Hello Test World</div>;
    render(<TestComponent />);

    expect(screen.getByText("Hello Test World")).toBeInTheDocument();
  });

  it("Mocks are working", () => {
    const mockFn = jest.fn();
    mockFn("test");

    expect(mockFn).toHaveBeenCalledWith("test");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("Async/await works in tests", async () => {
    const promise = Promise.resolve("success");
    const result = await promise;

    expect(result).toBe("success");
  });
});

// Simple API test
describe("Basic API Testing", () => {
  it("Can test basic functions", () => {
    function add(a: number, b: number): number {
      return a + b;
    }

    expect(add(2, 3)).toBe(5);
  });
});

// Mock fetch test
describe("Fetch Mock Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Global fetch mock works", async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "success" }),
    });

    const response = await fetch("/api/test");
    const data = await response.json();

    expect(data.message).toBe("success");
    expect(mockFetch).toHaveBeenCalledWith("/api/test");
  });
});
