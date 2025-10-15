# This simple javascript tool performs a basic cost-benefit analysis on external research funding

The config.json file defines the overhead policy, list of funders, and how
University and Faculty co-funding is applied in the calculator.

The calculator automatically reads this file when it loads from
the same directory as index.html


1) OVERHEAD POLICY

The 'overhead' section defines the department's default indirect
cost (overhead) rates, for information and internal calculations.

Example:
  \"overhead\": {
    \"label\": \"2025\",
    \"salary_percent\": 62,
    \"other_percent\": 52
  }

• label – short text shown in the UI badge
• salary_percent – overhead % on salary costs
• other_percent – overhead % on other costs


2) DEFAULT FUNDING SCHEME

  \"defaultScheme\": \"vr\"

Determines which scheme is selected by default when the page loads.
The value must match one of the 'id' entries under 'schemes'.


3) ADDING OR EDITING FUNDERS / GRANT SCHEMES

Each grant scheme is listed as an object in the 'schemes' array:

  {
    \"id\": \"unique_id\",
    \"name\": \"Grant Scheme Name\",
    \"funder\": { ... },
    \"uf_rules\": [ ... ]
  }


3A) FUNDER OBJECT

The 'funder' object defines how the funding body covers indirect costs.

Choose ONE of the following modes:

1. \"percent_overhead\"  – covers a % of the department overhead.
   Example: { \"mode\": \"percent_overhead\", \"value\": 100,
              \"label\": \"Covers all overhead costs\" }

2. \"percent_total\" – covers indirects as a % of total project budget
   (using a cascading formula).
   Example: { \"mode\": \"percent_total\", \"value\": 25,
              \"label\": \"Up to 25% for indirect costs\" }

3. \"absolute\" – covers a fixed SEK amount of overhead.
   Example: { \"mode\": \"absolute\", \"value\": 150000,
              \"label\": \"Fixed 150 000 SEK overhead\" }

4. \"none\" – no specific coverage of indirect costs.
   Example: { \"mode\": \"none\", \"value\": 0, \"label\": \"No coverage\" }

5. \"manual\" – reserved for the 'Other' scheme (user enters values manually).
   Example: { \"mode\": \"manual\", \"value\": null, \"label\": \"Manual entry\" }

3B) UNIVERSITY / FACULTY (UF) CONTRIBUTION RULES

Each funder may include one or more university/faculty co-funding rules
under 'uf_rules'.  If there is none, set it to an empty array: [].

Each rule must contain:
• name – who contributes (e.g., “Vice Chancellor”, “Faculty”)
• mode – how the contribution is calculated
• notes – short description shown to the user

Available modes:

1. \"percent_total\"  → percentage of total project amount.
   { \"name\": \"Vice Chancellor\", \"mode\": \"percent_total\",
     \"value\": 25, \"notes\": \"VC 25% of total\" }

2. \"percent_total_capped_per_year\"  → % of total, capped per year.
   { \"name\": \"Faculty\", \"mode\": \"percent_total_capped_per_year\",
     \"value\": 5, \"per_year_cap\": 1000000,
     \"notes\": \"Faculty 5% (max 1M/yr)\" }

3. \"fixed_per_year\"  → fixed SEK amount per project year.
   { \"name\": \"Vice Chancellor\", \"mode\": \"fixed_per_year\",
     \"amount_per_year\": 750000, \"notes\": \"VC 750k/yr\" }

───────────────────────────────────────────────────────────────
3C) ORDER AND THE 'OTHER' SCHEME
───────────────────────────────────────────────────────────────
• Normal schemes appear in the order listed.
• The special 'Other' scheme is automatically shown last and allows users
  to type custom coverage values in the UI.
  Example:
    {
      \"id\": \"other\",
      \"name\": \"Other\",
      \"funder\": { \"mode\": \"manual\", \"value\": null,
                   \"label\": \"Manual entry\" },
      \"uf_rules\": []
    }


4) VALIDATION AND BEST PRACTICES

• Every 'id' must be unique.
• 'defaultScheme' must match one of those ids.
• Numeric fields must not contain percent signs or commas.
• If a scheme has no university/faculty contributions, use \"uf_rules\": [].
• 'label' and 'notes' fields are for display text only.


5) QUICK EXAMPLES

A) Funder covers all overhead, no university/faculty contribution:
  {
    \"id\": \"vr\",
    \"name\": \"VR – Swedish Research Council\",
    \"funder\": { \"mode\": \"percent_overhead\", \"value\": 100,
                  \"label\": \"Covers all overhead costs\" },
    \"uf_rules\": []
  }

B) Funder covers 20% overhead + VC and Faculty contributions:
  {
    \"id\": \"kaw_project\",
    \"name\": \"KAW – Projects\",
    \"funder\": { \"mode\": \"percent_overhead\", \"value\": 20,
                  \"label\": \"Up to 20% for indirect costs\" },
    \"uf_rules\": [
      { \"name\": \"Vice Chancellor\", \"mode\": \"percent_total\",
        \"value\": 25, \"notes\": \"VC 25% of total\" },
      { \"name\": \"Faculty\", \"mode\": \"percent_total_capped_per_year\",
        \"value\": 5, \"per_year_cap\": 1000000,
        \"notes\": \"Faculty 5% (max 1M/yr)\" }
    ]
  }

C) ERC-style 25% cascading coverage + fixed per-year contributions:
  {
    \"id\": \"erc_stg\",
    \"name\": \"ERC – Starting Grant\",
    \"funder\": { \"mode\": \"percent_total\", \"value\": 25,
                 \"label\": \"Up to 25% for indirect costs\" },
    \"uf_rules\": [
      { \"name\": \"Vice Chancellor\", \"mode\": \"fixed_per_year\",
        \"amount_per_year\": 750000, \"notes\": \"VC 750k/yr\" },
      { \"name\": \"Faculty\", \"mode\": \"fixed_per_year\",
        \"amount_per_year\": 250000, \"notes\": \"Faculty 250k/yr\" }
    ]
  }
