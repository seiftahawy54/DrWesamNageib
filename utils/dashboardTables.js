const generateTableShape = async (
  queryResult,
  wantedDataFn,
) => {
  const allPrimaryKeys = [];

  let data = await Promise.all(await queryResult.map(wantedDataFn));

  // data = Object.entries(data).map(([key, value], index) => {
  //   return {
  //     item: value,
  //   };
  // });

  return data;
};

export default generateTableShape;
