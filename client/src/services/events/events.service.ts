import { serverFetch } from "@/services/http";

export const createEventService = async (payload: any) => {
    const res = await serverFetch.post("/events", {
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
}

export const getEventStatusService = async (id: string) => {
    const res = await serverFetch.get(`/events/${id}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to get event status");
    }
    return data;
}

// We need an endpoint in the backend to get all events, or we can just mock it for now
export const getAllEventsService = async () => {
    const res = await serverFetch.get(`/events`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to get events");
    }
    return data;
}
