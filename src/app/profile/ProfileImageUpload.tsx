'use client';

import { ImagePlus } from 'lucide-react';

type ProfileImageUploadProps = {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ProfileImageUpload({ onFileChange }: ProfileImageUploadProps) {
  return (
    <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ImagePlus aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold">프로필 이미지 용량 줄이기</h3>
          <p className="mt-1 text-sm text-muted-foreground">포트폴리오에 등록하기 전 이미지 크기를 줄여주세요.</p>
        </div>
      </div>

      <label
        htmlFor="resize"
        className="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 focus-within:ring-2 focus-within:ring-ring"
      >
        <span className="mb-2 rounded-full bg-background p-2 text-muted-foreground shadow-sm transition-colors group-hover:text-primary">
          <ImagePlus aria-hidden="true" className="size-5" />
        </span>
        <span className="text-sm font-medium">
          <span className="text-primary">이미지를 선택</span>하거나 파일을 찾아보세요
        </span>
        <span className="mt-1 text-xs text-muted-foreground">이미지 파일 · 최대 1MB</span>
        <input
          className="sr-only"
          aria-label="압축할 프로필 이미지"
          id="resize"
          type="file"
          onChange={onFileChange}
          accept="image/*"
        />
      </label>
    </section>
  );
}
