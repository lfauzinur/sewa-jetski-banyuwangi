export const SERVICE_PRODUCT_TYPES = [
  { value: 'jetski', label: 'Jetski' },
  { value: 'paddle_board', label: 'Paddle Board' },
  { value: 'electric_boat', label: 'Kapal Listrik' },
  { value: 'sailing', label: 'Sailing' },
  { value: 'other', label: 'Watersport Lainnya' },
];

export const SERVICE_PRODUCT_TYPE_LABELS = Object.fromEntries(
  SERVICE_PRODUCT_TYPES.map(({ value, label }) => [value, label])
);

export function getServiceProductTypeLabel(value) {
  return SERVICE_PRODUCT_TYPE_LABELS[value] || SERVICE_PRODUCT_TYPE_LABELS.other;
}
