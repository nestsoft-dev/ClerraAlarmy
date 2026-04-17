📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

1. Product Name

Working title: Clerra Alarm (Discipline Mode)
(You can rename later, don’t waste time here)

⸻

2. Product Vision

Build a behavior enforcement alarm system that forces users to wake up and take action through adaptive challenges and accountability loops.

Not a reminder app.
Not a productivity app.
A discipline engine.

⸻

3. Core Problem

Users:
	•	Snooze alarms
	•	Ignore reminders
	•	Avoid discomfort
	•	Lie to themselves about consistency

Existing apps (including **Alarmy):
	•	Force wake-up
	•	But don’t track behavior over time deeply

⸻

4. Core Value Proposition

“This app doesn’t just wake you up — it adapts to your behavior and makes it harder to fail.”

⸻

5. Target Users (MVP)
	•	Students (wake early for study)
	•	Young professionals
	•	Self-improvement focused users

Avoid broad audience for now.

⸻

6. Core Features (MVP ONLY)

6.1 Alarm System
	•	Set time
	•	Repeat days
	•	Toggle on/off

⸻

6.2 Challenge Engine (CORE)

Types:
	•	Math
	•	Shake
	•	Photo

Each has:
	•	Difficulty Level (1–3)

⸻

6.3 Discipline Mode (DEFAULT)
	•	App assigns challenge
	•	User cannot choose
	•	Difficulty adapts based on behavior

⸻

6.4 Voice Commitment System (DIFFERENTIATOR)
	•	User records intention when setting alarm
	•	Audio plays when alarm rings

Purpose:
	•	Psychological pressure
	•	Self-accountability

⸻

6.5 Enforcement Loop

Flow:
	1.	Alarm triggers
	2.	Voice plays
	3.	Challenge assigned
	4.	User completes challenge

If success:
	•	Alarm stops
	•	Streak increases

If failure:
	•	Alarm escalates
	•	Harder challenge assigned
	•	Reflection required

⸻

6.6 Escalation System
	•	Fail 1 → repeat alarm (3 min)
	•	Fail 2 → louder + vibration
	•	Fail 3 → repeated notifications until completion

⸻

6.7 Streak & Failure Tracking
	•	Daily streak count
	•	Failure log
	•	Last failure message

⸻

6.8 Reflection System

Triggered only on failure:
	•	Prompt: “Why did you fail?”
	•	Stored locally

⸻

7. Non-Goals (IMPORTANT)

Do NOT build:
	•	Social features
	•	AI coaching
	•	Fancy analytics
	•	Too many challenge types

You’ll derail yourself.

⸻

8. UX Principles
	•	High pressure, not comfort
	•	Immediate feedback
	•	Minimal navigation
	•	Everything tied to behavior

⸻

9. Screens

9.1 Home Screen
	•	Streak header
	•	Alarm list
	•	Challenge indicators
	•	Status (completed/failed)

⸻

9.2 Create Alarm
	•	Time picker
	•	Repeat days
	•	Record voice
	•	Select mode (default: Discipline)

⸻

9.3 Alarm Ring Screen
	•	Full screen takeover
	•	Voice playback
	•	Challenge UI

⸻

9.4 Challenge Screen
	•	Dynamic based on type
	•	Success / failure handling

⸻

9.5 Reflection Screen
	•	Text input after failure

⸻

10. Success Metrics (REAL ONES)
	•	% of alarms successfully completed
	•	Daily active usage
	•	Streak retention (3+ days)
	•	Challenge completion rate

Not downloads. Not likes.

⸻

11. MVP Scope (CUT EVERYTHING ELSE)

You ship when:
	•	Alarm works
	•	3 challenges work
	•	Voice playback works
	•	Streak tracking works

That’s it.

⸻

🧠 SKILL.MD (WHAT YOU ACTUALLY NEED TO BUILD THIS)

This is where you stop lying to yourself about “I’ll figure it out.”

⸻

1. React Native Fundamentals

You must be comfortable with:
	•	Components
	•	State (useState, useEffect)
	•	Navigation (React Navigation)

If not → you’ll get stuck immediately.

⸻

2. Native Device Capabilities

Required:
	•	Notifications / Alarms
	•	expo-notifications or native modules
	•	Audio Recording & Playback
	•	expo-av
	•	Camera Access
	•	expo-camera
	•	Sensors (for shake)
	•	expo-sensors

⸻

3. Local Storage
	•	AsyncStorage OR SQLite

Used for:
	•	Alarms
	•	Streaks
	•	Voice files
	•	Reflections

⸻

4. Basic Algorithms (don’t skip this)

You need to implement:

Challenge selection logic
	•	Randomization
	•	Difficulty scaling

Streak system
	•	Increment / reset logic

Escalation system
	•	Timers
	•	Retry loops

⸻

5. Audio Handling (CRITICAL)
	•	Record voice
	•	Save locally
	•	Retrieve on alarm trigger
	•	Auto-play on alarm

If this breaks → your core feature is dead.

⸻

6. State Management (simple)

Use:
	•	Context API OR Zustand

Avoid Redux for now.

⸻

7. Debugging Skills

You WILL face:
	•	Background task issues (alarms not firing)
	•	Audio not playing
	•	App killed by OS

If you can’t debug → you won’t ship.

⸻

8. Platform Constraints (you’re underestimating this)

iOS & Android:
	•	Limit background execution
	•	Kill apps aggressively
	•	Restrict alarm precision

You may need:
	•	Native modules
	•	Workarounds for reliability

⸻

9. UI Implementation
	•	Flexbox layouts
	•	Reusable components
	•	Basic animation (optional)

Don’t overdesign.

⸻

10. Mindset (this is your biggest bottleneck)

You need to:
	•	Stop jumping ideas
	•	Finish one loop fully
	•	Ship ugly but working

⸻

🚨 Final Reality Check

You now have:
	•	A solid product concept
	•	A clear system
	•	A build path

If you don’t ship this, it’s not because:
	•	You lack ideas
	•	You lack tools

It’s because:

You avoided the hard parts (logic, enforcement, constraints)