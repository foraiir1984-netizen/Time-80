import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Linking,
  Pressable,
} from "react-native";
import { nodes, dataset } from "../services/classificationDataset";
import { ui, Button } from "./Ui";
export function ClassificationPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (code: string | null) => void;
}) {
  const [open, setOpen] = useState(false),
    [parent, setParent] = useState<string | null>(null),
    [search, setSearch] = useState("");
  const n = nodes.find((n) => n.code === value);
  const visible = nodes.filter((n) =>
    search
      ? n.code.includes(search) ||
        `${n.title_fa ?? ""} ${n.title_en}`
          .toLowerCase()
          .includes(search.toLowerCase())
      : n.parent_code === parent,
  );
  const choose = (code: string | null) => {
    onChange(code);
    setOpen(false);
  };
  return (
    <>
      <Button
        title={
          n
            ? `${n.code} · ${n.title_fa ?? n.title_en}`
            : "دستهٔ ICATUS: مشخص نشده"
        }
        onPress={() => {
          setParent(null);
          setSearch("");
          setOpen(true);
        }}
      />
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[ui.page, { paddingTop: 45 }]}>
          <Text style={ui.title}>دسته‌بندی ICATUS 2016</Text>
          <Text style={ui.muted}>
            انتخاب دسته اختیاری است. ترجمهٔ فارسی، ترجمهٔ محصول است.
          </Text>
          <TextInput
            style={ui.input}
            placeholder="جست‌وجوی کد یا عنوان"
            value={search}
            onChangeText={setSearch}
          />
          <View style={ui.row}>
            <Button title="بستن" onPress={() => setOpen(false)} />
            <Button title="بدون دسته" onPress={() => choose(null)} />
            {parent && (
              <Button
                title="سطح بالاتر"
                onPress={() =>
                  setParent(
                    nodes.find((n) => n.code === parent)?.parent_code ?? null,
                  )
                }
              />
            )}
          </View>
          <FlatList
            data={visible}
            keyExtractor={(n) => n.code}
            renderItem={({ item }) => (
              <View style={ui.card}>
                <Text style={ui.text}>
                  {item.code} · {item.title_fa ?? item.title_en}
                </Text>
                <View style={ui.row}>
                  <Button title="انتخاب" onPress={() => choose(item.code)} />
                  {item.level < 3 && (
                    <Button
                      title="جزئیات دسته"
                      onPress={() => {
                        setParent(item.code);
                        setSearch("");
                      }}
                    />
                  )}
                  <Button
                    title="تعریف رسمی"
                    onPress={() => {
                      Linking.openURL(
                        `${dataset.source_url}#${item.code}`,
                      ).catch(() => {});
                    }}
                  />
                </View>
              </View>
            )}
          />
        </View>
      </Modal>
    </>
  );
}
