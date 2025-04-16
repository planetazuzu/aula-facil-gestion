
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { FormLabel } from "@/components/ui/form";

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CourseForm({ open, onOpenChange, onSubmit }: CourseFormProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      topic: "",
      location: "",
      startDate: "",
      endDate: "",
      capacity: 20,
      instructor: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo curso</DialogTitle>
          <DialogDescription>
            Complete los detalles del curso y haga clic en guardar cuando termine.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="title" className="text-right">
                Título
              </FormLabel>
              <Input
                id="title"
                className="col-span-3"
                {...form.register("title", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="topic" className="text-right">
                Tema
              </FormLabel>
              <Input
                id="topic"
                className="col-span-3"
                {...form.register("topic", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="description" className="text-right">
                Descripción
              </FormLabel>
              <Textarea
                id="description"
                className="col-span-3"
                {...form.register("description", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="location" className="text-right">
                Ubicación
              </FormLabel>
              <Input
                id="location"
                className="col-span-3"
                {...form.register("location", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="startDate" className="text-right">
                Fecha inicio
              </FormLabel>
              <Input
                id="startDate"
                type="datetime-local"
                className="col-span-3"
                {...form.register("startDate", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="endDate" className="text-right">
                Fecha fin
              </FormLabel>
              <Input
                id="endDate"
                type="datetime-local"
                className="col-span-3"
                {...form.register("endDate", { required: true })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="capacity" className="text-right">
                Capacidad
              </FormLabel>
              <Input
                id="capacity"
                type="number"
                className="col-span-3"
                {...form.register("capacity", { required: true, min: 1 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <FormLabel htmlFor="instructor" className="text-right">
                Instructor
              </FormLabel>
              <Input
                id="instructor"
                className="col-span-3"
                {...form.register("instructor", { required: true })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
