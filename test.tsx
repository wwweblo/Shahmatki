<form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <MarkdownEditor
                        value={content}
                        onChange={setContent}
                        label="Содержание"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="hasChessBoard"
                        checked={hasChessBoard}
                        onCheckedChange={(checked) => setHasChessBoard(checked as boolean)}
                    />
                    <Label htmlFor="hasChessBoard">Добавить шахматную позицию</Label>
                </div>

                {hasChessBoard && (
                    {/* Шахматная доска */}
                )}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </form>
