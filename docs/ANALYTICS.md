# Analytics: keeping Conor's own traffic out

Three layers, because no single one covers everything. GA4 has **no
city-based data filter** — property-level filters only do IP (internal
traffic) and developer traffic — so "exclude Zanesville" has to happen at
query time.

Property `448490220` (account `320239026`), stream `12245754226`,
measurement ID `G-0440Q7V3FG`.

## 1. Per-browser opt-out (in this repo)

`src/Home/js/internalTraffic.js`. Visit `?internal=1` once in a browser and
that browser never sends a hit again — it sets
`window["ga-disable-G-0440Q7V3FG"]` before GTM loads. `?internal=0` undoes it.

Covers: browsers you remember to flag.
Misses: new browsers, private windows, phones, anything after you clear
storage.

## 2. IP-based internal traffic filter (GA4 admin)

Home IP `71.72.83.84` (Spectrum residential, `res.spectrum.com`, Zanesville
43701). Defined as internal traffic on the web stream, with the **Internal
Traffic** data filter set to Active.

Covers: every device on the home network, automatically.
Misses: historical data (filters are forward-only and permanent — excluded
hits are never collected, not just hidden), and any period after Spectrum
rotates the IP.

**Re-check the IP** if Zanesville starts showing up in reports again:
`curl -s https://ipinfo.io/json`. Update the rule under
Admin → Data streams → the stream → Configure tag settings → Show all →
Define internal traffic.

## 3. Report-time city exclusion (historical data)

Layer 2 can't clean data already collected, and it lapses whenever the IP
rotates. So every GA4 query run for Conor should exclude Zanesville, Ohio.

Scoped to Ohio on purpose — there is also a Zanesville, Indiana.

`dimension_filter` for the Data API / analytics MCP (snake_case protobuf):

```json
{
  "not_expression": {
    "and_group": {
      "expressions": [
        {
          "filter": {
            "field_name": "city",
            "string_filter": { "match_type": "EXACT", "value": "Zanesville" }
          }
        },
        {
          "filter": {
            "field_name": "region",
            "string_filter": { "match_type": "EXACT", "value": "Ohio" }
          }
        }
      ]
    }
  }
}
```

In the GA4 UI the same thing is a report comparison or an exploration
segment: `City` **does not exactly match** `Zanesville`.

Caveat worth knowing: this drops *all* Zanesville traffic, not just Conor's.
Zanesville is ~25k people, so a genuine local reader gets thrown out with the
bathwater. That is the accepted tradeoff — at this traffic volume a real
Zanesville visitor is far less likely than Conor reloading his own site.

## Auth for the analytics MCP

Working as of 2026-09-18. Service account key, no ADC user credential.

- Service account: `ga4-mcp@conor-hinchee-www.iam.gserviceaccount.com`
- Key: `~/.config/ga4-mcp/key.json`, also copied to
  `~/.config/gcloud/application_default_credentials.json`
- GA4: that service account is a **Viewer** on property `448490220`

A service account key file is itself a valid ADC file, so copying it to the
well-known ADC path means the MCP server picks it up with no `env` block and no
config edit. The desktop app's config lives in `~/Library/Application Support/`,
which macOS protects, so Cowork sessions cannot edit it.

Tradeoff: that service account is now the default credential for anything on
this Mac using ADC. It is read-only on one GA4 property. Running
`gcloud auth application-default login` overwrites it; re-copy the key after.

### Dead ends, so nobody repeats them

- **ADC user credential with `--scopes=...analytics.readonly`** — Google blocks
  the consent screen ("This app is blocked"). Not a Workspace API-controls
  setting: all 18 Google services were already Unrestricted with zero configured
  apps, and Analytics is not even in that list.
- **Impersonated ADC** (`--impersonate-service-account`) — silently useless.
  Scopes are not stored in the ADC file format for impersonated service
  accounts, so `--scopes` is ignored and you get a cloud-platform-only token,
  then `ACCESS_TOKEN_SCOPE_INSUFFICIENT` from the Data API. Open bug:
  github.com/googleanalytics/google-analytics-mcp/issues/80
- **Plain ADC** — expires, and Workspace Cloud session control can force
  reauth. The key file has neither problem.

### If the key ever needs recreating

`conor-hinchee-www` is a secure-by-default org, so
`constraints/iam.disableServiceAccountKeyCreation` is enforced org-wide and
applies to all six projects. None sit outside the org.

Note: `roles/resourcemanager.organizationAdmin` does **not** include org policy
permissions. `roles/orgpolicy.policyAdmin` is a separate grant, already held by
`sudo@conorhinchee.com` on org `631561635374`.

Policy changes take about **three minutes** to propagate, so loop rather than
sleeping once, and only restore enforcement if the key actually got created:

```bash
gcloud resource-manager org-policies disable-enforce \
  iam.disableServiceAccountKeyCreation --project=conor-hinchee-www

for i in $(seq 1 10); do
  if gcloud iam service-accounts keys create ~/.config/ga4-mcp/key.json \
       --iam-account="ga4-mcp@conor-hinchee-www.iam.gserviceaccount.com"; then
    chmod 600 ~/.config/ga4-mcp/key.json
    gcloud resource-manager org-policies enable-enforce \
      iam.disableServiceAccountKeyCreation --project=conor-hinchee-www
    break
  fi
  sleep 30
done
```

## Baseline, read 2026-09-17

Demographic details by City, last 28 days (Aug 20 - Sep 16 2026), read from the
GA4 UI because the MCP auth was still broken:

| | Active users | Engaged sessions | Events | Avg engagement |
| --- | --- | --- | --- | --- |
| Site total | 26 | 23 | 309 | 45s |
| Zanesville | 4 (15%) | 5 (22%) | 92 (30%) | 3m 54s |
| Excluding Zanesville | 22 | 18 | 217 | — |

Zanesville is 15% of users but 30% of events, at five times the site's average
engagement time. That profile is the owner, not a reader.

Worth watching: `Columbus` (1 user, 39 events, 1m 35s, 5 key events) has a
similar shape. If that turns out to be Conor on cellular, the city filter will
not catch it — cellular traffic geolocates to the carrier's egress, not the
handset.

## Two things to look at

**Property timezone is `America/Los_Angeles`.** Conor is in Ohio. Every daily
bucket is shifted three hours, so "yesterday" in a report is not yesterday
here. Changing it is not retroactive — GA4 applies a new timezone going forward
only, leaving a seam in the data. Worth deciding on deliberately rather than
discovering during an analysis.

**Columbus is now the largest row after Zanesville** — 1 user, 2 sessions, 39
events over 28 days. That event-per-session rate matches the Zanesville
profile. Most likely Conor on cellular, since mobile traffic geolocates to the
carrier egress. Test: load the site on a phone with wifi off and watch whether
Columbus moves. If it does, hit it once with `?internal=1` on that phone.
