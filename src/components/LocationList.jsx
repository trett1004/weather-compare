import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { LocationCard } from "./LocationCard";

export function LocationList({
  locations,
  onRemoveLocation,
  onReorderLocations,
  weatherModel,
  windUnit,
  onWindUnitToggle,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = locations.findIndex((l) => l.id === active.id);
    const newIndex = locations.findIndex((l) => l.id === over.id);
    onReorderLocations(arrayMove(locations, oldIndex, newIndex));
  }

  if (locations.length === 0) {
    return (
      <main className="locations-container empty-state">
        <p>Suche nach einem Ort, um den Forecast zu vergleichen.</p>
      </main>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={locations.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <main className="locations-container">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onRemove={onRemoveLocation}
              weatherModel={weatherModel}
              windUnit={windUnit}
              onWindUnitToggle={onWindUnitToggle}
            />
          ))}
        </main>
      </SortableContext>
    </DndContext>
  );
}
