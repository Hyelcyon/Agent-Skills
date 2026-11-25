from xml.etree.ElementTree import Element

import defusedxml.ElementTree as DefusedET


def parse_xml_safely(raw_xml: str) -> Element:
    if len(raw_xml) > 1024 * 1024:
        raise ValueError("XML payload exceeds maximum threshold")

    root = DefusedET.fromstring(
        raw_xml,
        forbid_dtd=True,
        forbid_entities=True,
        forbid_external=True,
    )
    return root

def extract_node_text(raw_xml: str, tag_name: str) -> str | None:
    root = parse_xml_safely(raw_xml)
    node = root.find(tag_name)
    if node is not None and node.text is not None:
        return node.text.strip()
    return None
