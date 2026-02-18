/* eslint-disable react-hooks/rules-of-hooks */
// import React, { useState } from 'react';
// import { FileText, Calendar, Download } from 'lucide-react';
// import Table from "../table/Table";

// // Extend BaseItem by adding id property
// interface CandidatesList {
//   id: string;
//   name: string;
//   email: string;
//   applyDate: string;
//   position: string;
//   cv: string;
//   interviewDate: string;
//   [key: string]: string | undefined;
// }

// const CandidatesListTable = () => {
//   const [selectedMonth, setSelectedMonth] = useState('Nov');
//   const [selectedYear, setSelectedYear] = useState('2024');
//   const [currentPage, setCurrentPage] = useState(1);
  
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const columns = [
//     {
//       key: "name",
//       title: "Name",
//       className: "text-gray-600 font-medium",
//       sortable: true,
//     },
//     {
//       key: "email",
//       title: "Email",
//       className: "text-gray-600",
//     },
//     {
//       key: "applyDate",
//       title: "Apply Date",
//       className: "text-gray-600",
//       render: (item: CandidatesList) => (
//         <div className="flex items-center gap-2">
//           <Calendar size={16} className="text-gray-400" />
//           {formatDate(item.applyDate)}
//         </div>
//       ),
//       sortable: true,
//     },
//     {
//       key: "position",
//       title: "Position",
//       className: "text-gray-600",
//     },
//     {
//       key: "cv",
//       title: "CV",
//       className: "text-gray-600",
//       render: (item: CandidatesList) => (
//         <div className="flex items-center gap-2">
//           <FileText size={16} className="text-gray-400" />
//           <a 
//             href={item.cv} 
//             target="_blank" 
//             rel="noopener noreferrer"
//             className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
//           >
//             {item.name.split(' ')[0]}_CV.pdf
//             <Download size={14} />
//           </a>
//         </div>
//       ),
//     },
//     {
//       key: "interviewDate",
//       title: "Interview Date",
//       className: "text-gray-600",
//       render: (item: CandidatesList) => (
//         <div className="flex items-center gap-2">
//           <Calendar size={16} className="text-gray-400" />
//           {formatDate(item.interviewDate)}
//         </div>
//       ),
//       sortable: true,
//     },
//   ];

//   const data: CandidatesList[] = [
//     {
//       id: "1",
//       name: "John Doe",
//       email: "johndoe@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/johndoe",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "2",
//       name: "Emeto Winner",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "3",
//       name: "John Doe",
//       email: "johndoe@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/johndoe",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "4",
//       name: "Emeto Winner",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "5",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "6",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "7",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "8",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "9",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "10",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//     {
//       id: "11",
//       name: "John Doe",
//       email: "emetowinner@gmail.com",
//       applyDate: "2024-10-10",
//       position: "Software Engineer",
//       cv: "https://example.com/emetowinner",
//       interviewDate: "2024-10-15",
//     },
//   ];

//   const handleAddNew = () => {
//     console.log('Add new candidate');
//   };

//   const handleViewCandidate = (candidate: CandidatesList) => {
//     console.log('View candidate:', candidate);
//   };

//   const handleEditCandidate = (candidate: CandidatesList) => {
//     console.log('Edit candidate:', candidate);
//   };

//   const handleDeleteCandidate = (candidate: CandidatesList) => {
//     console.log('Delete candidate:', candidate);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Filter Controls */}
//       <div className="flex gap-4 items-center">
//         <select 
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="Nov">November</option>
//           <option value="Dec">December</option>
//         </select>
        
//         <select 
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="2024">2024</option>
//           <option value="2023">2023</option>
//         </select>
//       </div>

//       {/* Table Component */}
//       <Table 
//         columns={columns} 
//         data={data} 
//         title="Candidate List"
//         addButton={{
//           label: "Add New",
//           onClick: handleAddNew
//         }}
//         actions={{
//           onView: handleViewCandidate,
//           onEdit: handleEditCandidate,
//           onDelete: handleDeleteCandidate,
//         }}
//         pagination={{
//           currentPage: currentPage,
//           totalPages: 10,
//           onPageChange: setCurrentPage,
//         }}
//         className="bg-white rounded-lg shadow"
//       />
//     </div>
//   );
// };

// export default CandidatesListTable;

import React, { useState } from "react";
import Table from "../table/Table";

interface Column<t>{
  key:string;
  title:string;
  render?: (item: t) => React.ReactNode;
  className?: string;
}

interface CandidatesList{
  id: string;
  name: string;
  email: string;
  closeDate: string;
  applyDate: string;
  department: string;
  position: string;
  cv: string;
  interviewDate: string;
  [key: string]: string | undefined;
}

const CandidatesListTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const data: CandidatesList[] = [
        {
          id: "1",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        },
        {
          id: "2",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        },
        {
          id: "3",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        },
        {
          id: "4",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        },
        {
          id: "5",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        },
        {
          id: "6",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        },
        {
          id: "7",
          name: "John Doe",
          email: "johndoe@gmail.com",
          closeDate: "2024-10-10",
          applyDate: "2024-10-10",
          department: "Software Engineering",
          position: "Software Engineer",
          cv: "https://example.com/johndoe",
          interviewDate: "2024-10-15"
        }
    ];

  const totalPages = Math.ceil(data.length / rowsPerPage);

  // const paddedData = [...data];
  // while (paddedData.length < currentPage * rowsPerPage) {
  //   paddedData.push({
  //     id: `empty-${paddedData.length}`, name: "",
  //     email: "",
  //     closeDate: "",
  //     applyDate: "",
  //     department: "",
  //     position: "",
  //     cv: "",
  //     interviewDate: ""
  //   });
  // }
  // const currentData = paddedData.slice(
  //   (currentPage - 1) * rowsPerPage,
  //   currentPage * rowsPerPage
  // );

  const columns: Column<CandidatesList>[] = [
    {
      key: "name",
      title: "Name",
      render:(item) => <span className="text-gray-600 font-medium">{item.name}</span>
          
      
      
    },
    {
      key: "email",
      title: "Email",
      render:(item) => <span className="text-gray-600">{item.email}</span>
    },
    {
      key: "closeDate",
      title: "Close Date",
render:(item) => <span className="text-gray-600">{item.closeDate}</span> },
    {
      key: "applyDate",
      title: "Apply Date",
render:(item) => <span className="text-gray-600">{item.applyDate}</span> },
    {
      key: "department",
      title: "Department",
render:(item) => <span className="text-gray-600">{item.department}</span> },
    {
      key: "position",
      title: "Position",
render:(item) => <span className="text-gray-600">{item.position}</span> },
    {
      key: "cv",
      title: "CV",
      render: (item) => (
        <div className="flex items-center gap-2">
          <a 
            href={item.cv} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {item.name.split(' ')[0]}_CV.pdf
          </a>
        </div>
      )
    },
    {
      key: "interviewDate",
      title: "Interview Date",
render:(item) => <span className="text-gray-600">{item.interviewDate}</span> }
  ]

  return(
    <Table 
      columns={columns}
      data={data}
      title="Candidates List"
      pagination={{
        currentPage,
        totalPages,
        onPageChange: setCurrentPage
      }}
    />
  )

}

export default CandidatesListTable;