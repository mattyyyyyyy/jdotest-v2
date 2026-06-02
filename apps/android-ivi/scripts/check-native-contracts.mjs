#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const androidRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(androidRoot, '../..');
const javaRoot = join(androidRoot, 'app/src/main/java');
const navRoot = join(javaRoot, 'com/jdo/ivi/ui/nav');
const screensRoot = join(javaRoot, 'com/jdo/ivi/ui/screens');

function read(path) {
  return readFileSync(path, 'utf8');
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const routesSource = read(join(navRoot, 'Routes.kt'));
const navHostSource = read(join(navRoot, 'JdoNavHost.kt'));
const kotlinSources = walk(javaRoot).filter((path) => path.endsWith('.kt')).map(read).join('\n');
const routes = new Map([...routesSource.matchAll(/const val (\w+)\s*=\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
const mounted = new Set([...navHostSource.matchAll(/composable\(Routes\.(\w+)\)/g)].map((m) => m[1]));
const referenced = new Set([...kotlinSources.matchAll(/Routes\.(\w+)/g)].map((m) => m[1]));

assert(routes.size === 21, `expected 21 declared routes, found ${routes.size}`);
for (const name of routes.keys()) assert(mounted.has(name), `route Routes.${name} is not mounted in JdoNavHost`);
for (const name of referenced) assert(routes.has(name), `navigation references undeclared Routes.${name}`);

const checkout = read(join(screensRoot, 'MallCheckoutFlow.kt'));
const product = read(join(screensRoot, 'MallProduct.kt'));
const browse = read(join(screensRoot, 'MallBrowse.kt'));
const orders = read(join(screensRoot, 'MallOrders.kt'));
const misc = read(join(screensRoot, 'MallMisc.kt'));
const network = read(join(javaRoot, 'com/jdo/ivi/data/NetworkClient.kt'));
const webCheckout = read(join(repoRoot, 'mockups/jdo-pencil-v3/screens/mall-checkout.jsx'));
const webPay = read(join(repoRoot, 'mockups/jdo-pencil-v3/screens/mall-pay.jsx'));

assert(checkout.includes('checkoutSelectedAsync { nav(Routes.MallPay) }'), 'checkout must navigate after backend success');
assert(checkout.includes('confirmLastPaymentAsync { nav(Routes.MallOrders) }'), 'payment must confirm before opening orders');
assert(network.includes('"/payments/$orderId/confirm"'), 'network client must call payment confirmation endpoint');
assert(product.includes('addCartItem(p.id, qty, size) { nav(Routes.MallCheckout) }'), 'buy-now must wait for cart write');
assert(browse.includes('AppState.detailId = p.id') && browse.includes('nav(Routes.MallDetail)'), 'search suggestion must open selected detail');
assert(orders.includes('"unpaid" -> allOrders.filter { it.rawStatus == "PENDING_PAYMENT" }'), 'orders tab must filter unpaid orders');
assert(misc.includes('ShoppingState.placeOrderAsync'), 'driving-mode reorder must create a real order');
assert(webCheckout.includes("sessionStorage.setItem('jdo:last-order-id'"), 'V3 Web checkout must pass created order id to payment page');
assert(webPay.includes("fetch('/api/v1/payments/' + orderId + '/confirm'"), 'V3 Web payment page must persist confirmation');

console.log(`commerce contracts ok: ${routes.size} native routes mounted, ${referenced.size} route references valid, V3 Web payment callback wired`);
