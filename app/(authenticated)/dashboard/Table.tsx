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

  return (
    <div className="overflow-x-auto border-2 border-border rounded-xl">
      <table className="min-w-full border-2 border-border rounded-xl text-left overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            {/* <th className="px-4 py-2 border border-border w-[10px]"></th> */}
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 border border-border">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2 border border-border">
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
