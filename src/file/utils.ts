export const decodeOriginalName = (name: string) => {
  const decodedName = Buffer.from(name, 'latin1').toString('utf8');

  return decodedName.includes('�') ? name : decodedName;
};
