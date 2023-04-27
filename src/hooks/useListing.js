import {useEffect, useState} from 'react';
// import * as API from '../utils/RestServices';
import * as API from '../utils/NewRestServices';

const useListing = (initialQuery, isFocused) => {
	const [query, setQuery] = useState(initialQuery);
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(true);
	const [hasMore, setHasMore] = useState(true);
	const [activePickList, setActivePickList] = useState(0);

	const loadResults = async (query) => {
		setLoading(true);
		const response = await API.fetchPickList(query);
		console.log('query', query);
		console.log('fetchPickList from uselisting', response);

		const temp = {...response};
		delete temp.results;
		console.log('meta harsh', temp);

		const list = response.results ? response.results : [];
		// eslint-disable-next-line no-unused-vars
		const meta = (({results, ...o}) => o)(response);
		console.log('use listing resuklts', meta);
		// console.log('resiltsxx', cloneMeta);
		// const meta = response.meta;
		setHasMore(meta.has_next);
		if (query.page > 1) {
			setResults([...results, ...list]);
		} else {
			setResults(list);
		}

		setLoading(false);
	};

	useEffect(() => {
		if (isFocused) {
			loadResults(query);
		}
	}, [query]);

	return {
		results,
		query,
		setQuery,
		loading,
		hasMore,
		setLoading,
		setResults,
		activePickList,
		setActivePickList,
	};
};

export default useListing;
