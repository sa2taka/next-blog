const fillBy0 = (num: number, length: number) => {
  return ('0000' + num.toString()).slice(-length);
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = fillBy0(date.getMonth() + 1, 2);
  const day = fillBy0(date.getDate(), 2);
  return `${year}/${month}/${day}`;
};
export const formatDateWithDay = (date: Date): string => {
  const year = date.getFullYear();
  const month = fillBy0(date.getMonth() + 1, 2);
  const day = fillBy0(date.getDate(), 2);
  const week = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${year}/${month}/${day}(${week})`;
};
export const formatDateForMachine = (date: Date): string => {
  const year = date.getFullYear();
  const month = fillBy0(date.getMonth() + 1, 2);
  const day = fillBy0(date.getDate(), 2);
  return `${year}-${month}-${day}`;
};
