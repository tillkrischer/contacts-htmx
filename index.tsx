import * as express from "express";
import * as elements from "typed-html";

const app = express();
const port = 3000;

let i = 1;

const BaseHtml = ({ children }: elements.Children) => (
  <html>
    <head>
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
    </head>
    <body>{children}</body>
  </html>
);

const Root = () => (
  <BaseHtml>
    <button hx-post="/clicked" hx-swap="outerHTML">
      Click Me
    </button>
  </BaseHtml>
);

app.get("/", (req, res) => {
  res.send(<Root />);
});

const Clicked = ({ i: number }) => (
  <button hx-post="/clicked" hx-swap="outerHTML">
    {i}
  </button>
);

app.post("/clicked", (req, res) => {
  i += 1;
  res.send(<Clicked i={i} />);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
