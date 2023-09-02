import * as express from "express";
import * as elements from "typed-html";

const app = express();
app.use(express.urlencoded({ extended: true }));
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

type Contact = {
  id: number;
  firstName: string;
  lastName: string;
};

const contacts = new Map<number, Contact>();

const BaseHtml = ({ children }: elements.Children) => (
  <html>
    <head>
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>{children}</body>
  </html>
);

app.get("/", (req, res) => {
  res.send(
    <BaseHtml>
      <div class="flex gap-4">
        <div class="w-[200px]">
          <div hx-get="/contacts" hx-trigger="load" hx-swap="outerHTML" />
        </div>
        <div id="form" class="flex-1" />
      </div>
    </BaseHtml>
  );
});

const Form = (props: { contact?: Contact }) => {
  const { contact } = props;

  let postUrl = "/contact";
  if (contact?.id) {
    postUrl = `/contact/${contact?.id}`;
  }

  return (
    <form hx-post={postUrl}>
      <div>
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={contact?.firstName ?? ""}
          class="border"
        />
      </div>
      <div>
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={contact?.lastName ?? ""}
          class="border"
        />
      </div>
      <button class="border">Submit</button>
    </form>
  );
};

app.get("/contact", (req, res) => {
  res.send(<Form />);
});

app.post("/contact", (req, res) => {
  const newId = Math.max(...contacts.keys(), 0) + 1;
  const newContact = {
    id: newId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };
  contacts.set(newId, newContact);

  res.set("HX-Trigger", "newContact");
  res.send(<Form contact={newContact} />);
});

app.get("/contact/:id", (req, res) => {
  const id = Number(req.params.id);
  var contact = contacts.get(id);

  res.set("HX-Trigger", "newContact");
  res.send(<Form contact={contact} />);
});

app.post("/contact/:id", (req, res) => {
  const id = Number(req.params.id);
  const newContact = {
    id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };
  contacts.set(id, newContact);

  res.set("HX-Trigger", "newContact");
  res.send(<Form contact={newContact} />);
});

const Contacts = (props: { entries: Contact[] }) => {
  const { entries } = props;
  return (
    <div
      hx-get="/contacts"
      hx-swap="outerHTML"
      hx-trigger="newContact from:body"
    >
      <button
        hx-get="/contact"
        hx-target="#form"
        hx-swap="innerHTML"
        class="border"
      >
        new contact
      </button>
      <ul>
        {entries.map((c: Contact) => {
          return (
            <li
              hx-get={`/contact/${c.id}`}
              hx-target="#form"
              hx-swap="innerHTML"
            >{`${c.firstName} ${c.lastName}`}</li>
          );
        })}
      </ul>
    </div>
  );
};

app.get("/contacts", (req, res) => {
  const entries = [...contacts.values()];
  res.send(<Contacts entries={entries} />);
});
