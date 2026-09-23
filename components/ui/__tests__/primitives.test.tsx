import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MicroLabel } from '@/components/ui/MicroLabel';
import { StatusMark } from '@/components/ui/StatusMark';
import { Stepper } from '@/components/ui/Stepper';
import { Segmented } from '@/components/ui/Segmented';
import { ToolToggle } from '@/components/ui/ToolToggle';

describe('MicroLabel', () => {
  it('마이크로 라벨 조합(mono 10px / .16em / 대문자 / dim)을 적용한다', () => {
    render(<MicroLabel>key</MicroLabel>);
    const el = screen.getByText('key');
    expect(el.className).toContain('font-mono');
    expect(el.className).toContain('uppercase');
    expect(el.className).toContain('text-dim');
  });
});

describe('StatusMark', () => {
  it('상태를 한글 라벨로 보여준다', () => {
    render(<StatusMark status="practicing" />);
    expect(screen.getByText('연습중')).toBeInTheDocument();
  });

  it('완성은 done 색 점을 쓴다', () => {
    const { container } = render(<StatusMark status="done" />);
    expect(container.querySelector('[data-dot]')!.className).toContain('bg-done');
  });
});

describe('Stepper', () => {
  it('−/+ 버튼에 aria-label을 붙이고 핸들러를 부른다', async () => {
    const dec = vi.fn();
    const inc = vi.fn();
    render(
      <Stepper label="KEY" value="A" onDec={dec} onInc={inc}
        decLabel="키 반음 내리기" incLabel="키 반음 올리기" />
    );
    await userEvent.click(screen.getByRole('button', { name: '키 반음 내리기' }));
    await userEvent.click(screen.getByRole('button', { name: '키 반음 올리기' }));
    expect(dec).toHaveBeenCalledOnce();
    expect(inc).toHaveBeenCalledOnce();
  });

  it('dock 크기는 터치 타깃 44px 이상을 유지한다', () => {
    render(
      <Stepper label="BPM" value="72" size="dock" onDec={() => {}} onInc={() => {}}
        decLabel="BPM 낮추기" incLabel="BPM 높이기" />
    );
    expect(screen.getByRole('button', { name: 'BPM 낮추기' }).className).toContain('h-[44px]');
  });
});

describe('Segmented', () => {
  it('선택된 값에 액센트 배경을 준다', async () => {
    const onChange = vi.fn();
    render(
      <Segmented value="2" onChange={onChange}
        options={[{ value: '1', label: '1단' }, { value: '2', label: '2단' }]} />
    );
    expect(screen.getByRole('button', { name: '2단' }).className).toContain('bg-accent');
    await userEvent.click(screen.getByRole('button', { name: '1단' }));
    expect(onChange).toHaveBeenCalledWith('1');
  });
});

describe('ToolToggle', () => {
  it('켜짐 상태를 aria-pressed로 알린다', () => {
    render(<ToolToggle active onClick={() => {}} icon={<svg aria-hidden="true" />} label="오토스크롤" />);
    expect(screen.getByRole('button', { name: /오토스크롤/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
