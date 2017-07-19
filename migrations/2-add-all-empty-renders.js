module.exports.id = 'add-all-empty-renders';

module.exports.up = function (done) {
  const templates = this.db.collection('templates');
  templates.update({ renders: { $exists: false } }, { $set: { renders: [] } }, { multi: true })
    .then(() => done());
};
