// GitHub ref creation is atomic; never delete or reuse a reserved ordinal.
module.exports = async function reserve(git, repository, scope, sha) {
  const prefix = `tags/easyaspie-builds/${scope}/`;
  for (let retry = 0; retry < 10; retry++) {
    const { data } = await git.listMatchingRefs({ ...repository, ref: prefix });
    const ordinal = 1 + Math.max(0, ...data.map(r => Number(r.ref.split('/').at(-1))).filter(Number.isFinite));
    const ref = `refs/${prefix}${String(ordinal).padStart(6, '0')}`;
    try {
      await git.createRef({ ...repository, ref, sha });
      return { scope, ordinal, ref };
    } catch (error) {
      if (error.status !== 422) throw error;
    }
  }
  throw new Error('Could not reserve a unique build number; no build was produced.');
};
