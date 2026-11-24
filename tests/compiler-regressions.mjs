// Run native Veryl projects with one explicit binary, retaining failures for comparison.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [binaryArg, outputArg] = process.argv.slice(2);
if (process.argv.length !== 4) throw new Error('usage: node compiler-regressions.mjs VERYL NEW_OUTPUT_DIR');
const binary = resolve(binaryArg), output = resolve(outputArg);
const fixtures = fileURLToPath(new URL('../regressions/', import.meta.url));
const projects = {
    basic: ['IncrementTest', 'StructWidthTest'],
    'generic-forwarding': ['ForwardingTest'],
    'generic-width': ['Top'],
    'wide-array': ['Top'],
    'struct-member-width': ['StructNeighborsTest'],
};
mkdirSync(output);
for (const backend of ['cc', 'cranelift']) {
    for (const [project, names] of Object.entries(projects)) {
        const label = backend + '-' + project;
        const result = spawnSync(binary, ['test', '--format', 'json', '--backend', backend,
            '--backend-validate', '1', '--seed', '23'], {
            cwd: join(fixtures, project), encoding: 'utf8', timeout: 120_000,
            env: { ...process.env, VERYL_DUT_REUSE: '0' },
        });
        writeFileSync(join(output, label + '.json'), result.stdout ?? '');
        writeFileSync(join(output, label + '.log'), result.stderr ?? '');
        try {
            if (result.error) throw result.error;
            assert.equal(result.signal, null);
            assert.equal(result.status, 0, 'compiler exit ' + result.status);
            const r = JSON.parse(result.stdout);
            assert.deepEqual([r.format_version, r.backend, r.passed, r.failed, r.ignored],
                [1, backend, names.length, 0, 0]);
            assert.deepEqual(r.tests.map(t => [t.name, t.status]).sort(),
                names.map(n => [n, 'pass']).sort());
            console.log('PASS', label, names.length);
        } catch (error) {
            console.error('FAIL', label, error.message);
            process.exitCode = 1;
        }
    }
}
