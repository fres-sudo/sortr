# Use Cases & Examples

Real-world examples of how to use Sortr effectively.

## Use Case 1: Personal Knowledge Management

**Scenario:** You take notes about various topics and want them organized automatically.

**Folder Structure:**

```
~/notes/
├── inbox/
├── work/
│   ├── meetings/
│   ├── projects/
│   └── tasks/
├── personal/
│   ├── health/
│   ├── finance/
│   └── hobbies/
└── learning/
    ├── programming/
    ├── languages/
    └── books/
```

**Workflow:**

```bash
# 1. Initialize once
sortr init ~/notes

# 2. Take notes in inbox
echo "Learned about Python decorators today..." > ~/notes/inbox/python-decorators.md
echo "Doctor appointment notes..." > ~/notes/inbox/checkup.md
echo "Sprint planning meeting notes..." > ~/notes/inbox/sprint-meeting.md

# 3. Sort automatically
sortr sort --auto

# Result:
# - python-decorators.md → learning/programming/
# - checkup.md → personal/health/
# - sprint-meeting.md → work/meetings/
```

## Use Case 2: Research Paper Organization

**Scenario:** Academic researcher organizing notes about papers and ideas.

**Folder Structure:**

```
~/research/
├── inbox/
├── papers/
│   ├── machine-learning/
│   ├── nlp/
│   └── computer-vision/
├── experiments/
├── ideas/
└── literature-reviews/
```

**Workflow:**

```bash
# Watch mode while reading papers
sortr watch

# As you read, create quick notes:
# - Paper summaries automatically go to papers/<topic>/
# - Research ideas go to ideas/
# - Experiment notes go to experiments/
```

## Use Case 3: Content Creator Workflow

**Scenario:** YouTuber/Blogger organizing content ideas and scripts.

**Folder Structure:**

```
~/content/
├── inbox/
├── video-ideas/
├── scripts/
│   ├── tutorials/
│   ├── reviews/
│   └── vlogs/
├── research/
└── published/
```

**Commands:**

```bash
# Morning: Start watch mode
sortr watch &

# Throughout day: Brain dump ideas
echo "Video idea: Top 10 AI tools" > ~/content/inbox/ai-tools-idea.md
echo "Review script for new laptop" > ~/content/inbox/laptop-review.md

# Evening: Check what was sorted
sortr stats
```

## Use Case 4: Software Development Notes

**Scenario:** Developer organizing bug notes, feature ideas, and documentation.

**Folder Structure:**

```
~/dev-notes/
├── inbox/
├── bugs/
│   ├── frontend/
│   ├── backend/
│   └── mobile/
├── features/
├── architecture/
├── code-snippets/
└── retrospectives/
```

**Integration with Git Workflow:**

```bash
# Create note from git commit message
git log -1 --pretty=%B > ~/dev-notes/inbox/last-commit.md

# Sort it
sortr move ~/dev-notes/inbox/last-commit.md --auto
```

## Use Case 5: Meeting Notes Organization

**Scenario:** Team lead organizing meeting notes by project and type.

**Folder Structure:**

```
~/meetings/
├── inbox/
├── standups/
├── planning/
├── retrospectives/
├── one-on-ones/
└── client-calls/
```

**Workflow:**

```bash
# After each meeting, save note to inbox with template
cat > ~/meetings/inbox/standup-2025-01-15.md << EOF
# Daily Standup - Jan 15
Team: Engineering
Attendees: Alice, Bob, Charlie

## Updates
- Alice: Finished feature X
- Bob: Working on bug Y
- Charlie: Starting feature Z

## Blockers
None
EOF

# Sort at end of day
sortr sort --auto
```

## Use Case 6: Zettelkasten Method

**Scenario:** Using slip-box method for interconnected notes.

**Folder Structure:**

```
~/zettelkasten/
├── inbox/
├── fleeting/      # Quick captures
├── literature/    # From reading
├── permanent/     # Refined ideas
└── projects/      # Active work
```

**Daily Practice:**

```bash
# Morning: Process inbox
sortr sort  # Interactive mode for careful curation

# During day: Quick captures
echo "Interesting thought..." > ~/zettelkasten/inbox/quick-note.md

# Evening: Review and refine
sortr stats
sortr sort --dry-run  # Preview before sorting
```

## Use Case 7: Multi-Language Notes

**Scenario:** Notes in different languages need different organization.

**Folder Structure:**

```
~/notes/
├── inbox/
├── english/
│   ├── work/
│   └── personal/
├── spanish/
│   ├── trabajo/
│   └── personal/
└── chinese/
    ├── work/
    └── personal/
```

**Note:** The AI model can understand multiple languages and will sort accordingly based on content and existing structure.

## Use Case 8: GTD (Getting Things Done) System

**Scenario:** Implementing David Allen's GTD methodology.

**Folder Structure:**

```
~/gtd/
├── inbox/           # Capture everything here
├── next-actions/    # Actionable tasks
├── projects/        # Multi-step outcomes
├── waiting-for/     # Delegated items
├── someday-maybe/   # Future possibilities
└── reference/       # Information to keep
```

**Workflow:**

```bash
# 1. Capture (throughout day)
echo "Call dentist" > ~/gtd/inbox/call-dentist.md
echo "Project idea: Home automation" > ~/gtd/inbox/home-automation.md

# 2. Process (daily or weekly)
sortr sort --auto

# 3. Result:
# - Simple tasks → next-actions/
# - Big ideas → projects/ or someday-maybe/
# - Reference info → reference/
```

## Pro Tips

### Tip 1: Create Templates

```bash
# Create note template function
function new-meeting() {
    cat > ~/notes/inbox/meeting-$(date +%Y%m%d).md << EOF
# Meeting - $(date +%Y-%m-%d)

## Attendees

## Agenda

## Notes

## Action Items
EOF
    echo "Created meeting note in inbox"
}
```

### Tip 2: Integrate with Cron

```bash
# Sort inbox every hour
0 * * * * /usr/local/bin/sortr sort --auto

# Weekly re-analysis
0 0 * * 0 /usr/local/bin/sortr init --re-analyze
```

### Tip 3: Combine with Grep

```bash
# Find all notes about a topic
grep -r "machine learning" ~/notes/

# Sort new notes about that topic
sortr move ~/notes/inbox/*ml*.md --auto
```

### Tip 4: Mobile Integration

```bash
# Use Dropbox/iCloud/Syncthing to sync inbox
# Add notes from mobile → they sync → auto-sorted!

# Example with Syncthing:
# 1. Sync inbox folder across devices
# 2. Run: sortr watch
# 3. Add notes from phone → automatically organized!
```

## Folder Structure Best Practices

1. **Keep it Flat-ish:** 2-3 levels deep is ideal
2. **Use Clear Names:** "work-meetings" not "wm"
3. **Be Consistent:** Pick a naming convention
4. **Avoid Too Many Folders:** 10-20 main categories max
5. **Use Dates Sparingly:** The tool learns patterns, not dates

## Common Patterns

### By Topic

```
notes/
├── technology/
├── health/
├── finance/
└── hobbies/
```

### By Project

```
notes/
├── project-alpha/
├── project-beta/
└── personal-projects/
```

### By Action Type

```
notes/
├── ideas/
├── tasks/
├── references/
└── archives/
```

### By Time

```
notes/
├── daily/
├── weekly/
├── monthly/
└── yearly/
```

Choose what works for YOUR brain! 🧠
