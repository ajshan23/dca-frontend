import{r as P,j as e,U as p,Q as R,K as S}from"./index-cOqvBBIr.js";import{u as L}from"./useQuery-DfbZlmc7.js";import{u as Q}from"./useMutation-C6r5hGln.js";import{e as T,f as k}from"./ProductService-JlHD3oXb.js";import"./Alert-CTDsJo34.js";import"./index-C8lJW4Vi.js";import{C as j,B as h}from"./Card-DIGZvD7G.js";import{B as N}from"./Button-DwOByDJ2.js";import{t as g,N as x}from"./Upload-DsbizeeT.js";import"./index-CBL9JDNu.js";import"./Drawer-u9YseTV0.js";import"./index-BmFHComS.js";import"./hoist-non-react-statics.cjs-B9oDFgJF.js";import"./index-Dgezmd6G.js";import"./index-CN4Vsls-.js";import"./Progress-CRnRERH5.js";import"./ScrollBar-CJQ4FW-3.js";import{D as I}from"./DataTable-CPwywcbC.js";import{z as B,A as O}from"./proxy-CuIDo5Hh.js";import{a as G}from"./index-DJ2xx_vj.js";import{C as $}from"./ClipLoader-Dev_y_P4.js";import"./toString-R3Kz-oVC.js";import"./Views-CoZ6zsbe.js";import"./CloseButton-DwYxsUt0.js";import"./_getPrototype-DsJNHg3O.js";import"./index-Chjiymov.js";const F=({children:n,defaultValue:i})=>{const[r,d]=P.useState(i);return e.jsx("div",{className:"tabs",children:p.Children.map(n,m=>p.isValidElement(m)?p.cloneElement(m,{activeTab:r,setActiveTab:d}):m)})},M=({children:n,activeTab:i,setActiveTab:r})=>e.jsx("div",{className:"flex border-b border-gray-200 mb-4",children:p.Children.map(n,d=>p.isValidElement(d)?p.cloneElement(d,{activeTab:i,setActiveTab:r}):d)}),U=({value:n,children:i,activeTab:r,setActiveTab:d})=>e.jsx("button",{className:`px-4 py-2 font-medium text-sm ${r===n?"border-b-2 border-blue-500 text-blue-600":"text-gray-500 hover:text-gray-700"}`,onClick:()=>d(n),children:i}),q=({value:n,children:i,activeTab:r})=>r===n?e.jsx("div",{className:"py-4",children:i}):null,z=()=>e.jsx("div",{className:"border-t border-gray-200 my-4"}),H={ASSIGNED:"bg-blue-500 text-white w-fit",RETURNED:"bg-emerald-500 text-white w-fit",LOST:"bg-red-500 text-white w-fit",DAMAGED:"bg-amber-500 text-white w-fit"},V={EXCELLENT:"bg-green-500 text-white w-fit",GOOD:"bg-blue-500 text-white w-fit",FAIR:"bg-yellow-500 text-white w-fit",POOR:"bg-red-500 text-white w-fit"},fe=()=>{var b,f,w,y;const{id:n}=R(),i=S(),{data:r,isLoading:d,error:m}=L({queryKey:["product",n],queryFn:()=>k(Number(n)),enabled:!!n,select:t=>{var a,l;return{...t,data:{...t.data,data:{...t.data.data,isAssigned:(a=t.data.data.assignments)==null?void 0:a.some(o=>o.status==="ASSIGNED"&&!o.returnedAt),currentAssignment:(l=t.data.data.assignments)==null?void 0:l.find(o=>!o.returnedAt)}}}}}),{mutate:v,isPending:A}=Q({mutationFn:async t=>{const a=await T(t);if(!(a!=null&&a.qrCode))throw new Error("Invalid QR code data received from server");return a.qrCode},onSuccess:t=>{if(typeof t!="string"){g.push(e.jsx(x,{title:"Error",type:"danger",children:"Invalid QR code data format"}));return}C(t)},onError:t=>{g.push(e.jsx(x,{title:"Error",type:"danger",children:t.message||"Failed to generate QR code"}))}}),C=t=>{var l;if(!t.startsWith("data:image/")){g.push(e.jsx(x,{title:"Error",type:"danger",children:"Invalid QR code data format"}));return}const a=window.open("","_blank","width=600,height=600");if(a&&((l=r==null?void 0:r.data)!=null&&l.data)){const o=r.data.data;a.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Product QR Code - ${o.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .header {
                margin-bottom: 20px;
              }
              .qr-container {
                margin: 20px auto;
                width: 300px;
                height: 300px;
              }
              .product-info {
                margin-bottom: 20px;
                text-align: center;
              }
              .product-info p {
                margin: 8px 0;
                font-size: 16px;
              }
              img {
                width: 100%;
                height: auto;
              }
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${o.name||"Product"} QR Code</h2>
              <p class="no-print">Printing will start automatically...</p>
            </div>
            <div class="product-info">
              <p><strong>Model:</strong> ${o.model||"N/A"}</p>
              <p><strong>ID:</strong> ${o.id}</p>
            </div>
            <div class="qr-container">
              <img src="${t}" alt="QR Code" onerror="window.alert('Failed to load QR code image')" />
            </div>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            <\/script>
          </body>
        </html>
      `),a.document.close()}else g.push(e.jsx(x,{title:"Error",type:"danger",children:"Could not open print window"}))},E=()=>{if(!n){g.push(e.jsx(x,{title:"Error",type:"danger",children:"Product ID is missing"}));return}v(Number(n))},D=[{header:"Employee",cell:t=>{var a,l;return e.jsxs("span",{children:[((a=t.row.original.employee)==null?void 0:a.name)||"Unknown",((l=t.row.original.employee)==null?void 0:l.empId)&&` (${t.row.original.employee.empId})`]})}},{header:"Assigned On",cell:t=>e.jsx("span",{children:new Date(t.row.original.assignedAt).toLocaleDateString()})},{header:"Returned On",cell:t=>e.jsx("span",{children:t.row.original.returnedAt?new Date(t.row.original.returnedAt).toLocaleDateString():"-"})},{header:"Status",cell:t=>e.jsx(h,{className:H[t.row.original.status]||"bg-gray-500",children:t.row.original.status})},{header:"Condition",cell:t=>t.row.original.condition?e.jsx(h,{className:V[t.row.original.condition]||"bg-gray-500",children:t.row.original.condition}):e.jsx("span",{children:"-"})},{header:"Assigned By",cell:t=>{var a;return e.jsx("span",{children:((a=t.row.original.assignedBy)==null?void 0:a.username)||"Unknown"})}}];if(m&&g.push(e.jsx(x,{title:"Error",type:"danger",children:m.message||"Failed to load product details"})),d)return e.jsx("div",{className:"flex items-center justify-center h-screen",children:e.jsx($,{color:"#3B82F6",size:40})});if(!((b=r==null?void 0:r.data)!=null&&b.data))return e.jsx("div",{className:"p-4 text-center",children:"Product not found"});const s=r.data.data,u=s.isAssigned,c=s.currentAssignment;return e.jsxs("div",{className:"container mx-auto p-4",children:[e.jsxs("div",{className:"flex justify-between items-start mb-4",children:[e.jsx(N,{variant:"plain",icon:e.jsx(B,{}),onClick:()=>i(-1),children:"Back to Products"}),e.jsx(N,{variant:"solid",icon:e.jsx(O,{}),loading:A,onClick:E,children:"Generate & Print QR"})]}),e.jsx(j,{className:"mb-6",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold mb-2",children:s.name}),e.jsx("p",{className:"text-gray-600 mb-4",children:s.model}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Category:"}),e.jsx("span",{className:"ml-2",children:((f=s.category)==null?void 0:f.name)||"-"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Branch:"}),e.jsx("span",{className:"ml-2",children:((w=s.branch)==null?void 0:w.name)||"-"})]}),s.department&&e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Department:"}),e.jsx("span",{className:"ml-2",children:s.department.name})]}),s.warrantyDate&&e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Warranty Until:"}),e.jsx("span",{className:"ml-2",children:new Date(s.warrantyDate).toLocaleDateString()})]}),e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Created At:"}),e.jsx("span",{className:"ml-2",children:new Date(s.createdAt).toLocaleDateString()})]}),e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Last Updated:"}),e.jsx("span",{className:"ml-2",children:new Date(s.updatedAt).toLocaleDateString()})]})]})]}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-4 mb-4",children:[e.jsx(h,{className:u?"text-white bg-blue-500":"text-white bg-emerald-500",children:u?"Assigned":"Available"}),e.jsx(h,{className:s.complianceStatus?"text-white bg-green-500":"text-white bg-red-500",children:s.complianceStatus?"Compliant":"Non-compliant"})]}),u&&c&&e.jsxs("div",{className:"bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Currently Assigned To"}),e.jsxs("p",{className:"text-gray-800 dark:text-gray-200",children:[c.employee.name,c.employee.empId&&` (${c.employee.empId})`]}),e.jsxs("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Assigned on: ",new Date(c.assignedAt).toLocaleDateString()]}),c.expectedReturnAt&&e.jsxs("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Expected return: ",new Date(c.expectedReturnAt).toLocaleDateString()]})]}),e.jsxs("div",{className:"bg-gray-50 dark:bg-gray-700 p-4 rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Notes"}),e.jsx("p",{className:"text-gray-600 dark:text-gray-300",children:s.notes||"No notes available"})]})]})]})}),e.jsx(z,{}),e.jsxs(F,{defaultValue:"assignments",children:[e.jsx(M,{children:e.jsx(U,{value:"assignments",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(G,{})," Assignments"]})})}),e.jsxs(q,{value:"assignments",children:[e.jsxs("div",{className:"mb-4",children:[e.jsx("h3",{className:"text-xl font-semibold",children:"Assignment History"}),e.jsx("p",{className:"text-gray-500",children:"All assignments for this product"})]}),((y=s.assignments)==null?void 0:y.length)===0?e.jsx(j,{className:"text-center py-8",children:e.jsx("p",{className:"text-gray-500",children:"No assignments found for this product"})}):e.jsx(j,{children:e.jsx(I,{columns:D,data:s.assignments||[]})})]})]})]})};export{fe as default};
