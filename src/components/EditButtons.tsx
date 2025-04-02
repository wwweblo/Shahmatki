'use client';

import { Button } from '@/components/ui/button';

interface EditButtonsProps {
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    isEditing: boolean;
}

export function EditButtons({ onEdit, onSave, onCancel, isEditing }: EditButtonsProps) {
    return (
        <div className="flex gap-2 mt-4">
            {!isEditing ? (
                <Button
                    onClick={onEdit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Редактировать
                </Button>
            ) : (
                <>
                    <Button
                        onClick={onSave}
                       
                    >
                        Сохранить
                    </Button>
                    <Button
                        onClick={onCancel}
                        variant="destructive"
                    >
                        Отмена
                    </Button>
                </>
            )}
        </div>
    );
} 