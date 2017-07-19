module.exports.id = 'add-empty-renders';

module.exports.up = function (done) {
  const collection = this.db.collection('templates');
  collection.update({ renders: { $exists: false } }, { $set: { renders: [] } })
    .then(() => { done(); });
};
