import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toolbar from './Toolbar';

describe('Toolbar', () => {
  it('calls onGranularityChange when a mode button is clicked', async () => {
    const onGranularityChange = vi.fn();
    render(
      <Toolbar
        granularity="lines"
        onGranularityChange={onGranularityChange}
        hasDiff={false}
        onClearAll={() => {}}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Words' }));
    expect(onGranularityChange).toHaveBeenCalledWith('words');
  });

  it('only shows the Clear all button when there is a diff', () => {
    const { rerender } = render(
      <Toolbar
        granularity="lines"
        onGranularityChange={() => {}}
        hasDiff={false}
        onClearAll={() => {}}
      />
    );
    expect(screen.queryByRole('button', { name: /Clear all/ })).not.toBeInTheDocument();

    rerender(
      <Toolbar granularity="lines" onGranularityChange={() => {}} hasDiff onClearAll={() => {}} />
    );
    expect(screen.getByRole('button', { name: /Clear all/ })).toBeInTheDocument();
  });

  it('calls onClearAll when clicked', async () => {
    const onClearAll = vi.fn();
    render(
      <Toolbar granularity="lines" onGranularityChange={() => {}} hasDiff onClearAll={onClearAll} />
    );
    await userEvent.click(screen.getByRole('button', { name: /Clear all/ }));
    expect(onClearAll).toHaveBeenCalled();
  });
});
