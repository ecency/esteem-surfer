export const makeGroupKeyForPosts = (what, tag) => {
    if (tag) {
        return `${what}-${tag}`;
    } else {
        return `${what}`;
    }
};