export default async function handler(req, res) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;
  const STATUS_PROPERTY = process.env.NOTION_STATUS_PROPERTY || "Status";
  const STATUS_VALUE = process.env.NOTION_STATUS_VALUE || "Read";
  const DATE_PROPERTY = process.env.NOTION_DATE_PROPERTY || "Date Finished";
  const YEAR = process.env.NOTION_YEAR || new Date().getFullYear().toString();

  if (!NOTION_TOKEN || !DATABASE_ID) {
    res.status(500).json({ error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID env vars" });
    return;
  }

  try {
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const body = {
        filter: {
          and: [
            {
              property: STATUS_PROPERTY,
              status: { equals: STATUS_VALUE }
            },
            {
              property: DATE_PROPERTY,
              date: { on_or_after: `${YEAR}-01-01` }
            },
            {
              property: DATE_PROPERTY,
              date: { before: `${parseInt(YEAR) + 1}-01-01` }
            }
          ]
        },
        page_size: 100
      };
      if (startCursor) body.start_cursor = startCursor;

      const response = await fetch(
        `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({ error: errText });
        return;
      }

      const data = await response.json();
      allResults = allResults.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const titlePropertyGuess = Object.keys(allResults[0]?.properties || {}).find(
      (key) => allResults[0].properties[key].type === "title"
    );

    const books = allResults.map((page) => {
      const titleProp = titlePropertyGuess ? page.properties[titlePropertyGuess] : null;
      const title = titleProp?.title?.[0]?.plain_text || "Untitled";
      const dateFinished = page.properties[DATE_PROPERTY]?.date?.start || null;
      return { title, dateFinished };
    });

    books.sort((a, b) => (a.dateFinished || "").localeCompare(b.dateFinished || ""));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ count: allResults.length, year: YEAR, books });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
