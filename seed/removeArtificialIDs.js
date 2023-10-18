const removeIds = async (modelData, idName) => {
    const promises = [];
    for (let i = 0; i < modelData.length; i++) {
        modelData[i].id = i;
        promises.push(modelData[i].save());
    }

    return Promise.all(promises);
}


