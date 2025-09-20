import { useRouter } from "next/navigation";
import React, { useState } from "react";

export interface Column {
  key: string; // data key
  label: string; // header label
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

  const router = useRouter()

  return (
    <div className="overflow-x-auto border-2 text-xl bg-white border-border rounded-xl">
      <table className="min-w-full border-0 !border-border rounded-xl text-left overflow-hidden">
        <thead className="">
          <tr>
            {/* <th className="px-4 py-2 border border-border w-[10px]"></th> */}
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-4 border border-border/40 bg-zinc-1003">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} onClick={() => router.push("/order/" + item.id)} className="hover:bg-accent-yellow/20 cursor-pointer transition-colors duration-100">
              
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-4 border border-border/40">
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
