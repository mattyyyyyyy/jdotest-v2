#!/usr/bin/env python3
import argparse
import re
import sys
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument("mode", choices=["tap", "assert"])
parser.add_argument("xml")
parser.add_argument("needle")
parser.add_argument("--contains", action="store_true")
args = parser.parse_args()

text = open(args.xml, encoding="utf-8").read()
end = text.find("</hierarchy>")
if end < 0:
    print(f"invalid UI hierarchy: {args.xml}", file=sys.stderr)
    sys.exit(1)
root = ET.fromstring(text[:end + len("</hierarchy>")])
parents = {child: parent for parent in root.iter() for child in parent}

def matches(node):
    values = (node.attrib.get("text", ""), node.attrib.get("content-desc", ""))
    return any(args.needle in value if args.contains else args.needle == value for value in values)

node = next((candidate for candidate in root.iter() if matches(candidate)), None)
if node is None:
    print(f"UI node not found: {args.needle}", file=sys.stderr)
    sys.exit(1)

if args.mode == "assert":
    print(f"found UI node: {args.needle}")
    sys.exit(0)

while node is not None and node.attrib.get("clickable") != "true":
    node = parents.get(node)
if node is None:
    print(f"clickable ancestor not found: {args.needle}", file=sys.stderr)
    sys.exit(1)

bounds = node.attrib.get("bounds", "")
match = re.fullmatch(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", bounds)
if match is None:
    print(f"invalid bounds: {bounds}", file=sys.stderr)
    sys.exit(1)
x1, y1, x2, y2 = map(int, match.groups())
print(f"{(x1 + x2) // 2} {(y1 + y2) // 2}")
