function exportCSV(data, filename) {
  if (!data.length) {
    toast("No data to export.", "warning");
    return;
  }
  const keys = Object.keys(data[0]),
    csv = [
      keys.join(","),
      ...data.map((row) =>
        keys
          .map((k) => `"${String(row[k] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
