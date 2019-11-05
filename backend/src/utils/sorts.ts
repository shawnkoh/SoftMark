interface withPageNo {
    pageNo: number;    
}

export function sortByPageNo<A extends withPageNo, B extends withPageNo>(a: A, b: B) {
    return a.pageNo - b.pageNo;
}