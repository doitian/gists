# Ulanzi TC002 refresh every 30 minutes

Use **Asia/Shanghai (UTC+08:00)** for all dates, times, slot identifiers, and comparisons.

Make **at most one image-send attempt per run**. Do not produce progress messages.

## Device access

Access the device only through the connected **Portal** MCP, using `tc002_image_send`.

## Deduplication

Before retrieving calendar data or generating an image:

1. Read the current time in **Asia/Shanghai** and determine the current local half-hour slot by rounding down to the nearest `:00` or `:30`. Include the local date in the slot identifier.
2. Read the persistent deduplication state for this automation. If that slot already has a confirmed successful push, stop silently.

Keep the deduplication state across runs. Record a successful push only after `tc002_image_send` explicitly reports `ok`. A confirmed absence of prior state means no previous successful push; unavailable or unreadable state is an error. If state cannot be read, report one brief error and stop.

A quiet stop means **no image send, no device change, and no output message**.

## Required calendar data

Read all of these calendars:

- **Agenda:** `me@****.me` and `ian@******.com`.
- **Holidays:** `中国节假日`.

Exclude agenda events that are all-day events or whose title contains `Personal Commitment`.

Retrieve enough data to identify:

- Events currently in progress, including events that started before the retrieval window.
- Events starting within the next **60 minutes**.
- Holidays covering today's local date.

The agenda lookahead remains **60 minutes**, even though the refresh interval is **30 minutes**.

Respect each calendar's date-range semantics, including exclusive end dates for all-day entries. Do not apply the agenda all-day exclusion to the holiday calendar.

If any required calendar data cannot be retrieved, report one brief error and stop. Never treat unavailable data as an empty calendar.

## Content selection

Apply these priorities in order:

### 1. Agenda

An eligible agenda event qualifies when either:

- It is ongoing: `start <= now < end`.
- It starts within the next 60 minutes: `now < start <= now + 60 minutes`.

Choose the qualifying event with the earliest start time. Resolve ties consistently, using the event title and then its stable identifier.

Create a motif based on the event's summary. Overlay its local start time in a small, readable **24-hour `HH:mm`** format, such as `17:30`. For a GIF, keep the time unchanged, in the same position, and readable in every frame.

### 2. Holiday

If no agenda event qualifies, check whether **today** is a China holiday in `中国节假日`.

If so, create a motif for a holiday whose date range includes today's local date. Never reuse yesterday's holiday art solely because it was previously displayed.

### 3. Other content

If neither agenda nor holiday content qualifies, randomly choose one of:

- **Date/time:** a motif reflecting the current local date or time.
- **News:** a hopeful motif based on verified current world news.
- **Weather:** icons representing current weather in **Nantong, Jiangsu (南通)**.

For news or weather, retrieve current information during this run. If it is unavailable or cannot be verified, use a date/time motif instead. Never invent news or weather.

## Image requirements

- Create an exact **52 × 16 pixel** canvas. Every GIF frame must use these dimensions.
- Use chunky, high-contrast pixel art with clearly recognizable shapes.
- Make every empty or background pixel pure opaque black: **`#000000`**. Do not use near-black or transparent backgrounds.
- Do not use photorealism, Bing images, or downscaled photos.
- Prefer hopeful, iconic symbols. Avoid graphic conflict imagery.
- Use a short looping GIF when motion improves the motif; aim for a file size under approximately **50 KB**. Otherwise, use PNG.
- Save the final device image as either `./tc002-out/device-52x16.gif` or `./tc002-out/device-52x16.png`.
- Save a **520 × 160 pixel** preview, enlarged with nearest-neighbor scaling, as `./tc002-out/preview-10x.png`. For a GIF, use a representative frame.

Before sending, verify the device image's dimensions, pure-black background, and readability. For a GIF, inspect every frame, including the consistency and readability of any time overlay.

## Final checks and delivery

Immediately before sending:

1. Refresh `now` in **Asia/Shanghai** and recalculate the current half-hour slot.
2. Re-read the persistent deduplication state.
3. If the current half-hour slot already has a confirmed successful push, stop silently.
4. Re-evaluate content selection using the refreshed time. Retrieve additional calendar data if the current date or selection window is no longer covered by the data already retrieved.
5. Confirm that the selected content is still the correct choice under the priority rules. For holiday content, confirm that the holiday still covers the current local date. Update any date/time motif that has become stale.

If the selected content is no longer the correct choice, repeat content selection, regenerate and verify the image, and repeat the final checks before proceeding.

Send the final **52 × 16** device image to **`random`** using `tc002_image_send`. Do not send the enlarged preview.

Treat the push as successful **only if the tool explicitly reports `ok`**. For any other result, including an ambiguous response, report one brief error and stop. **Do not retry**, record success, or claim that the device updated.

After an explicit `ok`, persist the slot checked immediately before sending as successfully updated. If saving this state fails, report briefly that the image was sent but deduplication state could not be saved. Do not send again.

## Output

- **Quiet stop:** no message.
- **Success:** one brief line stating the content category (`agenda`, `holiday`, `date/time`, `weather`, or `news`) and format (`still` or `GIF`). Example: `Updated: agenda · GIF.`
- **Failure:** one brief, accurate error line. Never expose secrets.
