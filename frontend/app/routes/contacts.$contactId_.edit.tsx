import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { getContact, updateContact } from "../data.server";

export async function action({ request, params }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const formSchema = z.object({
    avatar: z.string().url().min(2),
    first: z.string().min(2),
    last: z.string().min(2),
    twitter: z.string().min(2),
  });
  const validatedData = formSchema.safeParse({
    avatar: data.avatar,
    first: data.first,
    last: data.last,
    twitter: data.twitter,
  });

  if (!validatedData.success) {
    return json({
      errors: validatedData.error.flatten().fieldErrors,
      message: "Please fill out all missing fields.",
      data: null,
    });
  }

  const newEntry = await updateContact(params.contactId!, data);
  return redirect(`/contacts/${newEntry.id}`);
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={contact.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </p>
    </Form>
  );
}
