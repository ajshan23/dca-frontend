import {
    HiOutlineColorSwatch,
    HiOutlineDesktopComputer,
    HiOutlineTemplate,
    HiOutlineViewGridAdd,
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineOfficeBuilding,
    HiOutlineTag,
    HiOutlineUser,
    HiOutlineCube,
    HiOutlineClipboardList,
    HiOutlineCollection,
    HiOutlineChartSquareBar,
    HiOutlineDownload
} from 'react-icons/hi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    singleMenu: <HiOutlineViewGridAdd />,
    collapseMenu: <HiOutlineTemplate />,
    groupSingleMenu: <HiOutlineDesktopComputer />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
    // New icons for your navigation items
    users: <HiOutlineUsers />,
    branches: <HiOutlineOfficeBuilding />,
    categories: <HiOutlineTag />,
    employees: <HiOutlineUser />,
    products: <HiOutlineCube />,
    assignments: <HiOutlineClipboardList />,
    departments: <HiOutlineCollection />,
    productAssignments: <HiOutlineChartSquareBar />,
    export: <HiOutlineDownload />
}

export default navigationIcon