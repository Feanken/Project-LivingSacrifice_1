/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SharingForm } from "@/components/SharingForm";
import { CharacterCounter } from "@/components/CharacterCounter";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { FilterDropdown } from "@/components/FilterDropdown";
import { SearchBar } from "@/components/SearchBar";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

test("empty state shows the requirement text and create action", () => {
  render(<EmptyState />);
  expect(
    screen.getByText("Belum ada sharing firman yang tercatat"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Tulis sharing pertama" }),
  ).toHaveAttribute("href", "/sharing/baru");
});
test("error retry is actionable", async () => {
  const retry = jest.fn();
  render(<ErrorMessage message="Tidak dapat dimuat" onRetry={retry} />);
  await userEvent.click(screen.getByRole("button", { name: "Coba kembali" }));
  expect(retry).toHaveBeenCalledTimes(1);
});
test("counter signals the hard limit", () => {
  const { rerender } = render(<CharacterCounter current={0} max={5000} />);
  expect(screen.getByText("5.000 karakter tersisa")).not.toHaveClass(
    "near-limit",
  );
  rerender(<CharacterCounter current={5000} max={5000} />);
  expect(screen.getByText("0 karakter tersisa")).toHaveClass("near-limit");
});
test("form reports all blank fields and never submits invalid input", async () => {
  const submit = jest.fn();
  render(<SharingForm onSubmit={submit} />);
  await userEvent.click(screen.getByRole("button", { name: "Bagikan firman" }));
  expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
  expect(screen.getByText("Nama pembagi wajib diisi")).toBeInTheDocument();
  expect(screen.getByText("Isi ringkasan wajib diisi")).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/Judul firman/)).toHaveFocus();
});
test("summary textarea enforces its native and controlled 5000 character limits", async () => {
  render(<SharingForm onSubmit={jest.fn()} />);
  const textarea = screen.getByLabelText(/Isi ringkasan/);
  expect(textarea).toHaveAttribute("maxlength", "5000");
  await userEvent.click(textarea);
  await userEvent.paste("a".repeat(5100));
  expect((textarea as HTMLTextAreaElement).value).toHaveLength(5000);
  expect(screen.getByText("0 karakter tersisa")).toBeInTheDocument();
});
test("search can be cleared and author selection reports exact values", async () => {
  const search = jest.fn(),
    filter = jest.fn();
  render(
    <>
      <SearchBar value="kasih" onChange={search} />
      <FilterDropdown
        names={["Lydia", "Fransisco"]}
        value=""
        onChange={filter}
      />
    </>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Kosongkan pencarian" }),
  );
  expect(search).toHaveBeenCalledWith("");
  await userEvent.selectOptions(screen.getByRole("combobox"), "Lydia");
  expect(filter).toHaveBeenCalledWith("Lydia");
});
test("delete dialog includes the title, starts on cancel, and calls callbacks", async () => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  const confirm = jest.fn(),
    cancel = jest.fn();
  render(
    <DeleteConfirmDialog
      open
      title="Hidup dalam kasih"
      onConfirm={confirm}
      onCancel={cancel}
    />,
  );
  expect(screen.getByText("“Hidup dalam kasih”")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Batal" })).toHaveFocus();
  await userEvent.click(screen.getByRole("button", { name: "Batal" }));
  expect(cancel).toHaveBeenCalledTimes(1);
  await userEvent.click(
    screen.getByRole("button", { name: "Konfirmasi hapus" }),
  );
  expect(confirm).toHaveBeenCalledTimes(1);
});
