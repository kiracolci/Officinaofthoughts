import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "./TimelineModal.css";

interface EventType {
  date: string;
  title: string;
  description: string;
}

interface Props {
  editing?: boolean;
  case_?: any;
  timeline?: EventType[];
  onClose: () => void;
}

export function TimelineModal({ editing = false, case_, timeline, onClose }: Props) {
  const updateTimeline = useMutation(api.cases.updateTimeline);

  const sourceTimeline = editing
    ? case_?.timeline || []
    : timeline || [];

  const [events, setEvents] = useState<EventType[]>(sourceTimeline);

  // ⭐ View mode sorted newest → oldest
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // --------------------------
  // LINK MODAL
  // --------------------------
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkURL, setLinkURL] = useState("");
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0, text: "" });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleContextMenu = (
    e: React.MouseEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    if (!editing) return;

    e.preventDefault();

    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const selected = textarea.value.substring(start, end);

    setSelection({ start, end, text: selected });
    setActiveEvent(index);
    setShowLinkModal(true);
  };

  const applyLink = () => {
    if (activeEvent === null || !selection.text || !linkURL) return;

    // IMPORTANT: Work on original array, NOT sorted one
    const updated = [...events];
    const desc = updated[activeEvent].description;

    const before = desc.substring(0, selection.start);
    const after = desc.substring(selection.end);

    updated[activeEvent].description =
      `${before}<a href="${linkURL}" target="_blank">${selection.text}</a>${after}`;

    setEvents(updated);
    setShowLinkModal(false);
    setLinkURL("");
  };

  const saveTimeline = async () => {
    if (!case_) return;
    await updateTimeline({ id: case_._id, timeline: sortedEvents });
    onClose();
  };

  const updateField = (realIndex: number, field: keyof EventType, value: string) => {
    const updated = [...events];
    updated[realIndex][field] = value;
    setEvents(updated);
  };

  const addEvent = () => {
  setEvents([
    { date: "", title: "", description: "" }, // new event goes FIRST
    ...events
  ]);
};


  const deleteEvent = (realIndex: number) => {
    setEvents(events.filter((_, i) => i !== realIndex));
  };

  // ------------------------------------------
  // ⭐ VIEW MODE
  // ------------------------------------------
  if (!editing) {
    return (
      <div className="timeline-overlay">
        <div className="timeline-view-box">
          <button className="close-btn" onClick={onClose}>×</button>

          <h2 className="timeline-title view">Case Timeline</h2>
          <p className="timeline-direction">Newest → Oldest</p>

          <div className="timeline-scroll">
            <div className="timeline-horizontal">
              <div className="timeline-line"></div>

              {sortedEvents.map((ev, i) => (
                <div key={i} className="timeline-point">
                  <div className="dot"></div>

                  <p className="tl-date">{ev.date}</p>

                  <div
                    className="event-box"
                    dangerouslySetInnerHTML={{
                      __html: `
                        <div class="tl-title">${ev.title}</div>
                        <div class="tl-desc">${ev.description}</div>
                      `
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // ⭐ EDIT MODE
  // ------------------------------------------

  // We sort for display but KEEP original index reference
  const sortedForEditor = [...events]
    .map((ev, idx) => ({ ...ev, realIndex: idx }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="timeline-overlay">
      <div className="timeline-edit-box">
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="timeline-title">EDIT THE TIMELINE</h2>

        {/* ⭐ Controls at top */}
        <div className="edit-controls-top">
          <button className="add-event" onClick={addEvent}>+ add event</button>

          <div className="edit-actions">
            <button className="save-btn" onClick={saveTimeline}>save changes</button>
            <button className="cancel-btn" onClick={onClose}>cancel</button>
          </div>
        </div>

        {/* ⭐ Sorted editor list */}
        {events.map((ev, i) => (
  <div key={i} className="edit-event-box">

    <input
      type="date"
      className="edit-input"
      value={ev.date}
      onChange={(e) => updateField(i, "date", e.target.value)}
    />

    <input
      type="text"
      className="edit-input"
      placeholder="title"
      value={ev.title}
      onChange={(e) => updateField(i, "title", e.target.value)}
    />

    <textarea
      className="edit-textarea"
      placeholder="description"
      value={ev.description}
      ref={textareaRef}
      onContextMenu={(e) => handleContextMenu(e, i)}
      onChange={(e) => updateField(i, "description", e.target.value)}
    />

    {/* ⭐ Save event (sorting happens here) */}
    <button
      className="save-single-event"
      onClick={() => {
        const sorted = [...events].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEvents(sorted);
      }}
    >
      Save Event
    </button>

    <button className="delete-event" onClick={() => deleteEvent(i)}>
      Remove Event
    </button>
  </div>
))}


      </div>

      {/* LINK MODAL */}
      {showLinkModal && (
        <div className="link-modal">
          <div className="link-modal-content">
            <h3>Add URL Link</h3>

            <input
              type="url"
              placeholder="https://example.com"
              value={linkURL}
              onChange={(e) => setLinkURL(e.target.value)}
            />

            <div className="link-modal-actions">
              <button className="submit-button" onClick={applyLink}>Insert</button>
              <button className="cancel-button" onClick={() => setShowLinkModal(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
