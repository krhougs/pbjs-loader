import ProtoBuf from 'protobufjs';
import loaderUtils from 'loader-utils';
import path from 'path';
import fs from 'fs';

function getTargets() {
	const targets = {};
	const dirname = path.join(path.parse(require.resolve('protobufjs')).dir, 'cli', 'targets');
	const files = fs.readdirSync(dirname);
	files.forEach((f) => {
		if (path.extname(f) === '.js') {
			targets[path.basename(f, '.js')] = require(path.join(dirname, f));
		}
	});
	return targets;
}
const targets = getTargets();

export default function () {
	const defaultOpts = {
		create: false,
		encode: true,
		decode: true,
		verify: false,
		convert: false,
		delimited: true,
		beautify: false,
		comments: true,
		wrap: 'commonjs',
		paths: []
	};

	const callback = this.async();
	const options = Object.assign(
		defaultOpts,
		loaderUtils.getOptions(this)
	);
	const resource = this.resourcePath;

	const root = new ProtoBuf.Root();

	const paths = options.paths;

	paths.push(path.relative(process.cwd(), path.join(require.resolve('protobufjs'), "..")));

	root.resolvePath = function pbjsResolvePath(origin, target) {
		const normOrigin = ProtoBuf.util.path.normalize(origin);
		const normTarget = ProtoBuf.util.path.normalize(target);

		const resolved = ProtoBuf.util.path.resolve(normOrigin, normTarget, true);

		const idx = resolved.lastIndexOf("google/protobuf/");
		if (idx > -1) {
			const altname = resolved.substring(idx);
			if (altname in ProtoBuf.common) {
				resolved = altname;
			}
		}

		if (fs.existsSync(resolved)) {
			return resolved;
		}

		for (let i = 0; i < paths.length; ++i) {
			const iresolved = ProtoBuf.util.path.resolve(paths[i] + "/", target);
			if (fs.existsSync(iresolved)) {
				return iresolved;
			}
		}

		return resolved;
	};

	if (this.cacheable) { this.cacheable(); }

	try {
		root.loadSync(resource, {
			'keepCase': options['keep-case'] || false
		}); // sync is deterministic while async is not
	} catch (err) {
		callback(err);
		throw err;
	}

	const targetMethod = options.target ? targets[options.target] : targets['static-module'];

	if (!targetMethod) { throw new Error('Invalid target.'); }

	targetMethod(root, options, function (error, output) {
		callback(error, output);
	});
};
