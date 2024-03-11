import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact, getContact } from "~/data.server";

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.contactId, "Missing contactId");
  await deleteContact(params.contactId);
  return redirect("/");
}
