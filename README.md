# Books read widget

A tiny embeddable widget that shows a live count of books you've finished this year, pulled straight from your Notion database. Deploys on Vercel, embeds in Notion via an Embed block.

## 1. Create a Notion integration

1. Go to https://www.notion.so/my-integrations
2. Click **New integration**, name it (e.g. "Books widget"), pick your workspace, click **Submit**.
3. Copy the **Internal Integration Secret** — you'll need this as `NOTION_TOKEN`.

## 2. Share your database with the integration

1. Open your books database in Notion (e.g. My Bookshelf).
2. Click **•••** in the top right → **Connections** → search for and add your integration.

## 3. Get your database ID

Open the database as a full page and copy the URL. It looks like:

```
https://www.notion.so/yourworkspace/1934a99d2b5781679cbfc097337876e8?v=...
```

The **database ID** is the 32-character string right after your workspace name (`1934a99d2b5781679cbfc097337876e8` in the example above). This is `NOTION_DATABASE_ID`.

## 4. Confirm your property names

This widget assumes:
- A **Status** property with a value like `Read`
- A **date** property called `Date Finished`

If your database uses different names (e.g. `Finished?` instead of `Status`), you'll set that via environment variables in step 6 — no code changes needed.

## 5. Push this project to GitHub

```bash
cd books-widget
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/books-widget.git
git push -u origin main
```

## 6. Deploy on Vercel

1. Go to https://vercel.com, sign in with GitHub.
2. Click **Add new project**, import the `books-widget` repo.
3. Before deploying, add environment variables (**Settings → Environment Variables**):

   | Name | Value |
   |---|---|
   | `NOTION_TOKEN` | your integration secret from step 1 |
   | `NOTION_DATABASE_ID` | your database ID from step 3 |
   | `NOTION_STATUS_PROPERTY` | `Status` (or your actual property name) |
   | `NOTION_STATUS_VALUE` | `Read` (or your actual status value) |
   | `NOTION_DATE_PROPERTY` | `Date Finished` (or your actual property name) |
   | `NOTION_YEAR` | `2026` (optional — defaults to the current year) |

4. Click **Deploy**.
5. Once deployed, you'll get a URL like `https://books-widget-yourname.vercel.app`.

## 7. Embed it in Notion

1. In Notion, go to the page where you want the widget (e.g. Reading Journal).
2. Type `/embed` and select **Embed**.
3. Paste your Vercel URL.
4. Resize the embed block as you like.

The widget will now show a live, auto-loading count each time the page opens, with a manual **Refresh** button too. Since it queries Notion server-side, your integration secret never touches the browser.

## Notes

- The Notion API doesn't push live updates, so the widget checks on page load / refresh click, not in real time as you edit Notion elsewhere.
- If book counts don't match what you expect, double check your `NOTION_STATUS_PROPERTY`, `NOTION_STATUS_VALUE`, and `NOTION_DATE_PROPERTY` env vars match your database's actual property names exactly (case-sensitive).
- Free Vercel hosting is sufficient for this — no paid plan needed.
