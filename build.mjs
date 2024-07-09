#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';

import { FetchCrunchNode } from 'fetchcrunch';

class HTMLCompressor extends FetchCrunchNode {
	_zopfliIterations() {
		// Increase me!
        return 50;
    }
	_selfFetchUrl() {
		// Maybe change to an empty string
		return '#';
	}
	_bodyId() {
		return 'b';
	}
	_jsNewlines() {
		// We're not compressing JS so it would be better to just disable it
		return new Set();
	}
	_htmlTemplate() {
		return `<body id=${this._bodyId()} onload="__bootstrap__">`;
	}
	_onloadAttribute() {
		return `fetch('${this._selfFetchUrl()}').then(r=>new Response(r.body.pipeThrough(new DecompressionStream('deflate-raw'))).text()).then(s=>${this._bodyId()}.outerHTML='<body '+s)`;
	}
}

async function main() {
	const originalContents = await readFile('index.html', 'utf-8');
	const bodyContents = (originalContents
		.trim()
		// Remove all newlines and indentation
		.replace(/[\r\n]\s*/g, '')
		// Whitespaces between tags
		.replace(/(^|>)\s*(<|$)/g, '$1$2')
		// Strip the <body>: Would be in the bootstrap
		.replace(/^<body[^>]*>/, '')
	);

	const compressed = await new HTMLCompressor().crunch('>' + bodyContents);
	await writeFile('compressed.html', compressed);
	console.log(compressed.byteLength);
}

main();