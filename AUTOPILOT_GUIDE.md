# 🚀 NORTHSTAR AUTOPILOT - 65,000 LEADS

## Quick Start

### 1. **Prepare Your Leads File**

You need your 65,000 leads in **CSV** or **JSON** format:

**CSV Format (leads.csv):**
```
email,firstName,lastName,organization,title,city,state,phone
john.smith@hospital.com,John,Smith,Houston Methodist,CEO,Houston,TX,713-555-0001
jane.doe@clinic.com,Jane,Doe,Blue Cross,CFO,Dallas,TX,972-555-0002
```

**JSON Format (leads.json):**
```json
[
  {
    "email": "john.smith@hospital.com",
    "firstName": "John",
    "lastName": "Smith",
    "organization": "Houston Methodist",
    "title": "CEO",
    "city": "Houston",
    "state": "TX",
    "phone": "713-555-0001"
  }
]
```

### 2. **Import Your Leads**

```powershell
node autopilot-leads.js import leads.csv
# or
node autopilot-leads.js import leads.json
```

You'll see:
```
📥 [BULK IMPORT] Loading from leads.csv...
✅ Loaded 65000 leads
💾 Saved 65000 valid leads to pool
✅ Imported 65000 leads. Autopilot starting...
```

### 3. **Watch It Push**

The autopilot will now continuously push your leads:

```
🤖 AUTOPILOT | Pool: 65000 leads remaining | Today: 0
======================================================================
⚡ [PUSH CYCLE] Starting at 2:45:30 PM
📤 Pushing 5 batches (10000 total leads)...
  Batch 1: 2000/2000 ✓
  Batch 2: 1998/2000 ✓
  Batch 3: 2000/2000 ✓
  Batch 4: 1999/2000 ✓
  Batch 5: 1950/2000 ✓

✅ Cycle complete: +9947 leads
   Today: 9947 | Total: 9947
```

## How It Works

| Setting | Value | Notes |
|---------|-------|-------|
| **Batch Size** | 2,000 leads | Each "push" sends 2,000 leads |
| **Parallel Batches** | 5 | Pushes 5 batches simultaneously (10,000/cycle) |
| **Check Interval** | 30 seconds | Runs every 30 seconds |
| **Throughput** | ~1,200 leads/min | At full speed |

## Time Estimates

- **65,000 leads** = ~54 minutes (if continuously pushing)
- **Actual time** = ~2-3 hours (accounts for API rate limits, waiting periods)

## Commands

```powershell
# Import and start
node autopilot-leads.js import leads.csv

# Check status anytime
node autopilot-leads.js status

# Start autopilot (if already imported)
node autopilot-leads.js

# Stop (Ctrl + C)
```

## Status Output

```powershell
node autopilot-leads.js status
```

Shows:
```
📊 AUTOPILOT STATUS
======================================================================
Total pushed all-time: 65000
Pushed today: 32000
Leads in pool: 33000
Bulk imports: 1
Last push: 2026-03-12T14:45:30.123Z
======================================================================
```

## Logs

- **autopilot.log** - Push activity log
- **autopilot-stats.json** - Overall statistics
- **leads-pool.json** - Remaining leads (auto-deleted when empty)

## Troubleshooting

**Problem:** "INSTANTLY_API_KEY not set"
- Add to your `.env`:
  ```
  INSTANTLY_API_KEY=your_key_here
  INSTANTLY_CAMPAIGN_ID=your_campaign_id
  ```

**Problem:** CSV not loading
- Make sure headers match: `email, firstName, lastName, organization, title, city, state, phone`
- Use lowercase column names

**Problem:** Slow pushing
- Check your Instantly API rate limits
- Autopilot will automatically pace itself
- Monitor in Instantly dashboard to see leads arriving

## Next Steps

1. **Prepare your 65,000 leads** in CSV or JSON
2. **Run import**: `node autopilot-leads.js import leads.csv`
3. **Watch the dashboard** as leads pour in
4. **Monitor Twilio** - no more "out of leads" warnings!

---

**Questions? Check logs or run `node autopilot-leads.js status`**
