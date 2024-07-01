import { ForeignExpectation2D } from "@/types";
import { Dispatch, FormEvent, SetStateAction } from "react";

type FormProps = {
  setForeignExpectations: Dispatch<SetStateAction<ForeignExpectation2D[]>>;
};

export default function Form({ setForeignExpectations }: FormProps) {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/addPair", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });

    // Handle response if necessary
    const data = await response.json();
    console.log(data);
    setForeignExpectations(data);
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        expectation
        <input type="text" name="expectation" />
      </label>
      <label>
        experience
        <input type="text" name="experience" />
      </label>
      <button type="submit">send</button>
    </form>
  );
}
