import { useRouter } from "next/navigation";
import React, { useState } from "react";

export interface Column {
  key: string; // data key
  label: string; // header label
  align?: "left" | "right" | "center"; // optional alignment control
}

export interface TableProps<T> {
  columns: Column[];
  data: T[];
}

const CheckboxTable = <T extends { id: number }>({ columns, data }: TableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const router = useRouter();

  return (
    <div className="overflow-x-auto text-xl p-2 py-0 rounded-xl bg-white border-border ">
      <table className="min-w-full border-2 !border-border rounded-xl  text-left overflow-hidden">
        <thead className="">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key}
                className={`px-5 py-4 border border-border/40 bg-zinc-100 ${
                  col.align === "right" || index >= columns.length - 2
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => router.push("/order/" + item.id)}
              className="hover:bg-zinc-100 cursor-pointer transition-colors duration-100"
            >
              {columns.map((col, index) => (
                <td
                  key={col.key}
                  className={`px-5 py-4 border border-border/40 ${
                    col.align === "right" || index >= columns.length - 2
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {(item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckboxTable;
