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
      <meta charset="UTF-8"></meta>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      ></meta>
      <script src="https://unpkg.com/htmx.org@1.9.5"></script>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>{children}</body>
  </html>
);

app.get("/", (req, res) => {
  res.send(
    <BaseHtml>
      <div class="h-screen flex flex-col justify-center items-center">
        <div class="flex gap-4">
          <div hx-get="/contacts" hx-trigger="load" hx-swap="outerHTML" />
          <Separator />
          <div id="form" class="flex-1" />
        </div>
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
    <form hx-post={postUrl} class="space-y-4">
      <div class="space-y-2">
        <Label>First Name</Label>
        <Input type="text" name="firstName" value={contact?.firstName ?? ""} />
      </div>
      <div class="space-y-2">
        <Label>Last Name</Label>
        <Input type="text" name="lastName" value={contact?.lastName ?? ""} />
      </div>
      <Button>submit</Button>
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
      class="space-y-4"
    >
      <Button hx-get="/contact" hx-target="#form" hx-swap="innerHTML">
        new contact
      </Button>
      <ul>
        {entries.map((c: Contact) => {
          return (
            <li
              hx-get={`/contact/${c.id}`}
              hx-target="#form"
              hx-swap="innerHTML"
              class="cursor-pointer"
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

const Input = (attributes: elements.Attributes) => {
  return (
    <input
      class="border-input flex h-10 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2"
      {...attributes}
    />
  );
};

const Label = ({ children, ...attributes }: elements.Attributes) => {
  return (
    <label class="text-sm font-medium leading-none" {...attributes}>
      {children}
    </label>
  );
};

const Button = ({ children, ...attributes }: elements.Attributes) => {
  return (
    <button
      class="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      {...attributes}
    >
      {children}
    </button>
  );
};

const Separator = ({ children, ...attributes }: elements.Attributes) => {
  return (
    <div class="shrink-0 bg-gray-100 h-full w-[1px]" {...attributes}>
      {children}
    </div>
  );
};
